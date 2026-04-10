const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");
const Batch = require("../models/Batch");
const Course = require("../models/Course");
const Examinee = require("../models/Examinee");
const Coupon = require("../models/Coupon");
const sendEmail = require("../utils/sendMail");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { buildPurchasedBatchEntry } = require("../utils/batchAccess");

const hasRazorKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const razorpay = hasRazorKeys
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const generateReceiptNumber = () =>
  `RCPT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const generateTransactionId = () =>
  `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const toPlain = (value) => (value?.toObject ? value.toObject() : value);
const getBatchKey = (userId, batchId) => `${String(userId)}:${String(batchId)}`;
const resolveBatchAmount = (batch, requestedAmount = 0) => {
  const explicitAmount = Number(requestedAmount || 0);
  if (explicitAmount > 0) return explicitAmount;
  if (Number(batch?.discountPrice || 0) > 0) return Number(batch.discountPrice);
  return Number(batch?.price || 0);
};

const upsertPaymentJourney = async ({
  user,
  batch,
  course,
  amount,
  originalAmount,
  discountAmount,
  paymentMethod = "manual",
  paymentStatus = "pending",
  purchaseStage = "explored",
  gatewayOrderId = "",
  transactionId = "",
  notes = "",
  couponCode = null,
  couponId = null,
}) => {
  const existing = await Payment.findOne({
    user: user._id,
    batch: batch._id,
    paymentStatus: { $in: ["pending", "failed"] },
  }).sort({ createdAt: -1 });

  const payload = {
    user: user._id,
    course: course._id,
    batch: batch._id,
    amount: Number(amount || 0),
    originalAmount: Number(originalAmount || amount || 0),
    discountAmount: Number(discountAmount || 0),
    paymentMethod,
    paymentStatus,
    purchaseStage,
    gatewayOrderId: gatewayOrderId || existing?.gatewayOrderId || "",
    transactionId: transactionId || existing?.transactionId || generateTransactionId(),
    receiptNumber: existing?.receiptNumber || generateReceiptNumber(),
    exploredAt: existing?.exploredAt || new Date(),
    lastStageAt: new Date(),
    notes: notes || existing?.notes || "",
    couponCode: couponCode || existing?.couponCode || null,
    couponId: couponId || existing?.couponId || null,
  };

  if (paymentStatus === "success") {
    payload.paidAt = new Date();
  } else {
    payload.paidAt = existing?.paidAt || null;
  }

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  const payment = new Payment(payload);
  await payment.save();
  return payment;
};

const mergePaymentWithAccess = (user, accessEntries = [], payments = []) => {
  const rows = [];
  const paymentByBatch = new Map();

  payments.forEach((payment) => {
    const p = toPlain(payment);
    const batchId = p?.batch?._id || p?.batch;
    if (!batchId) return;
    paymentByBatch.set(getBatchKey(user._id, batchId), p);
  });

  accessEntries.forEach((entry) => {
    const access = toPlain(entry);
    const batchId = access?.batch?._id || access?.batch;
    if (!batchId) return;

    const payment = paymentByBatch.get(getBatchKey(user._id, batchId)) || null;
    rows.push({
      _id: payment?._id || `${String(user._id)}-${String(batchId)}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
      },
      course: payment?.course || access.course || null,
      batch: payment?.batch || access.batch || null,
      amount: Number(payment?.amount || 0),
      originalAmount: Number(payment?.originalAmount || payment?.amount || 0),
      discountAmount: Number(payment?.discountAmount || 0),
      paymentMethod: payment?.paymentMethod || (access.accessType === "free" ? "free" : "manual"),
      paymentStatus:
        payment?.paymentStatus || (access.accessStatus === "active" ? "success" : "pending"),
      purchaseStage:
        payment?.purchaseStage || (access.accessStatus === "active" ? "access_granted" : "payment_pending"),
      transactionId: payment?.transactionId || "ACCESS-GRANTED",
      receiptNumber: payment?.receiptNumber || "N/A",
      gatewayOrderId: payment?.gatewayOrderId || "",
      paidAt: payment?.paidAt || access.enrolledAt || access.accessStartsAt || null,
      exploredAt: payment?.exploredAt || null,
      lastStageAt: payment?.lastStageAt || null,
      notes: payment?.notes || "",
      couponCode: payment?.couponCode || null,
      accessStatus: access.accessStatus || "active",
      accessType: access.accessType || "paid",
      accessStartsAt: access.accessStartsAt || null,
      accessExpiresAt: access.accessExpiresAt || null,
      assignedByAdmin: Boolean(access.assignedByAdmin),
      recordType: payment ? "payment" : "access",
    });
  });

  payments.forEach((payment) => {
    const p = toPlain(payment);
    const batchId = p?.batch?._id || p?.batch;
    if (!batchId) return;

    const alreadyExists = rows.some(
      (row) => String(row.batch?._id || row.batch) === String(batchId)
    );

    if (!alreadyExists) {
      const derivedAccessStatus =
        p.paymentStatus === "success"
          ? "active"
          : p.paymentStatus === "failed"
          ? "rejected"
          : "pending";
      rows.push({
        _id: p._id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          number: user.number,
        },
        course: p.course || null,
        batch: p.batch || null,
        amount: Number(p.amount || 0),
        originalAmount: Number(p.originalAmount || p.amount || 0),
        discountAmount: Number(p.discountAmount || 0),
        paymentMethod: p.paymentMethod || "manual",
        paymentStatus: p.paymentStatus || "success",
        purchaseStage: p.purchaseStage || "payment_successful",
        transactionId: p.transactionId || "N/A",
        receiptNumber: p.receiptNumber || "N/A",
        gatewayOrderId: p.gatewayOrderId || "",
        paidAt: p.paidAt || p.createdAt || null,
        exploredAt: p.exploredAt || null,
        lastStageAt: p.lastStageAt || null,
        notes: p.notes || "",
        couponCode: p.couponCode || null,
        accessStatus: derivedAccessStatus,
        accessType: "paid",
        accessStartsAt: null,
        accessExpiresAt: null,
        assignedByAdmin: false,
        recordType: "payment",
      });
    }
  });

  return rows.sort(
    (a, b) =>
      new Date(b.paidAt || b.accessStartsAt || 0).getTime() -
      new Date(a.paidAt || a.accessStartsAt || 0).getTime()
  );
};

// ── Build receipt HTML ────────────────────────────────────────────────────
function buildReceiptHtml({ userName, courseName, batchName, amount, transactionId, receiptNumber, couponCode, date }) {
  const couponRow = couponCode
    ? `<tr><td style="padding:10px;border:1px solid #e5e7eb"><strong>Coupon Used</strong></td><td style="padding:10px;border:1px solid #e5e7eb">${couponCode}</td></tr>`
    : "";
  return `<div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:30px">
    <div style="max-width:650px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08)">
      <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:24px;color:#fff;text-align:center">
        <h2 style="margin:0">Payment Successful &#127881;</h2>
        <p style="margin:8px 0 0">Your batch access has been activated</p>
      </div>
      <div style="padding:24px">
        <p>Dear <strong>${userName || "Student"}</strong>,</p>
        <p>Your payment was successful! Your batch is now active in your dashboard.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:18px">
          <tr><td style="padding:10px;border:1px solid #e5e7eb"><strong>Course</strong></td><td style="padding:10px;border:1px solid #e5e7eb">${courseName}</td></tr>
          <tr><td style="padding:10px;border:1px solid #e5e7eb"><strong>Batch</strong></td><td style="padding:10px;border:1px solid #e5e7eb">${batchName}</td></tr>
          <tr><td style="padding:10px;border:1px solid #e5e7eb"><strong>Amount Paid</strong></td><td style="padding:10px;border:1px solid #e5e7eb">Rs. ${amount}</td></tr>
          ${couponRow}
          <tr><td style="padding:10px;border:1px solid #e5e7eb"><strong>Transaction ID</strong></td><td style="padding:10px;border:1px solid #e5e7eb">${transactionId}</td></tr>
          <tr><td style="padding:10px;border:1px solid #e5e7eb"><strong>Receipt No.</strong></td><td style="padding:10px;border:1px solid #e5e7eb">${receiptNumber}</td></tr>
          <tr><td style="padding:10px;border:1px solid #e5e7eb"><strong>Date</strong></td><td style="padding:10px;border:1px solid #e5e7eb">${date}</td></tr>
        </table>
        <div style="margin-top:24px;text-align:center">
          <a href="${process.env.FRONTEND_URL || "https://computer-excellence-academy.vercel.app"}/UserDash/my-batches"
             style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px">
            Open My Batches
          </a>
        </div>
        <p style="margin-top:24px">Thank you,<br/><strong>Computer Excellence Academy</strong></p>
      </div>
    </div>
  </div>`;
}

// ── Admin: Manual payment / free enrollment ───────────────────────────────
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, batchId, paymentMethod, transactionId, amount, notes } = req.body;
    if (!userId || !batchId) {
      return res.status(400).json({ success: false, message: "userId and batchId are required." });
    }

    const user = await Examinee.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const batch = await Batch.findById(batchId).populate("course");
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found." });

    const course = await Course.findById(batch.course?._id || batch.course);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const alreadyPurchased = (user.purchasedBatches || []).some(
      (item) => String(item.batch) === String(batch._id)
    );
    if (alreadyPurchased) {
      return res.status(400).json({ success: false, message: "Batch already purchased." });
    }

    const finalAmount =
      Number(amount || 0) > 0
        ? Number(amount)
        : Number(batch.discountPrice || 0) > 0
        ? Number(batch.discountPrice)
        : Number(batch.price || 0);

    const payment = new Payment({
      user: user._id,
      course: course._id,
      batch: batch._id,
      amount: finalAmount,
      originalAmount: finalAmount,
      paymentMethod: paymentMethod || "manual",
      transactionId: transactionId || generateTransactionId(),
      receiptNumber: generateReceiptNumber(),
      paymentStatus: "success",
      paidAt: new Date(),
      notes: notes || "",
    });
    await payment.save();

    user.purchasedBatches.push(
      buildPurchasedBatchEntry({ batch, paymentId: payment._id, accessType: "paid", assignedByAdmin: true })
    );
    await user.save();

    if (typeof batch.enrolledStudents === "number") {
      batch.enrolledStudents += 1;
      await batch.save();
    }

    try {
      const html = buildReceiptHtml({
        userName: user.name,
        courseName: course.title,
        batchName: batch.batchName,
        amount: finalAmount,
        transactionId: payment.transactionId,
        receiptNumber: payment.receiptNumber,
        date: new Date(payment.paidAt).toLocaleString(),
      });
      await sendEmail(user.email, "Payment Successful — Computer Excellence Academy", html);
    } catch (_) { /* Email failure does not block flow */ }

    return res.status(201).json({ success: true, message: "Payment successful and batch assigned.", data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Admin: Get all payments ───────────────────────────────────────────────
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email number")
      .populate("course", "title")
      .populate("batch", "batchName batchCode mode")
      .sort({ createdAt: -1 });

    const students = await Examinee.find()
      .select("name email number purchasedBatches")
      .populate("purchasedBatches.batch", "batchName batchCode mode")
      .populate("purchasedBatches.course", "title")
      .lean();

    const paymentMapByUser = new Map();
    payments.forEach((payment) => {
      const userId = String(payment.user?._id || payment.user);
      if (!paymentMapByUser.has(userId)) {
        paymentMapByUser.set(userId, []);
      }
      paymentMapByUser.get(userId).push(payment);
    });

    const merged = students.flatMap((student) =>
      mergePaymentWithAccess(
        student,
        student.purchasedBatches || [],
        paymentMapByUser.get(String(student._id)) || []
      )
    );

    return res.json({ success: true, data: merged });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Student: Get own payment history ─────────────────────────────────────
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const user = await Examinee.findById(req.userId)
      .select("name email number purchasedBatches")
      .populate("purchasedBatches.batch", "batchName batchCode mode")
      .populate("purchasedBatches.course", "title");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const payments = await Payment.find({ user: req.userId })
      .populate("course", "title")
      .populate("batch", "batchName batchCode mode")
      .sort({ createdAt: -1 });

    const merged = mergePaymentWithAccess(user, user.purchasedBatches || [], payments);
    return res.json({ success: true, data: merged });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/explore", authMiddleware, async (req, res) => {
  try {
    const { batchId } = req.body || {};
    if (!batchId) {
      return res.status(400).json({ success: false, message: "batchId is required." });
    }

    const [user, batch] = await Promise.all([
      Examinee.findById(req.userId),
      Batch.findById(batchId).populate("course"),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }
    const alreadyPurchased = (user.purchasedBatches || []).some(
      (entry) =>
        String(entry.batch?._id || entry.batch) === String(batch._id) &&
        String(entry.accessStatus || "").toLowerCase() === "active"
    );
    if (alreadyPurchased) {
      return res.status(400).json({ success: false, message: "Batch already unlocked for this user." });
    }

    const course = await Course.findById(batch.course?._id || batch.course);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const payment = await upsertPaymentJourney({
      user,
      batch,
      course,
      amount: resolveBatchAmount(batch),
      originalAmount: Number(batch.price || 0),
      discountAmount: Math.max(Number(batch.price || 0) - resolveBatchAmount(batch), 0),
      paymentMethod: "manual",
      paymentStatus: "pending",
      purchaseStage: "explored",
      notes: "Student opened batch purchase details.",
    });

    return res.json({
      success: true,
      message: "Batch exploration logged successfully.",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== "admin" && String(req.userId) !== String(req.params.userId)) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    const user = await Examinee.findById(req.params.userId)
      .select("name email number purchasedBatches")
      .populate("purchasedBatches.batch", "batchName batchCode mode")
      .populate("purchasedBatches.course", "title");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const payments = await Payment.find({ user: req.params.userId })
      .populate("course", "title")
      .populate("batch", "batchName batchCode mode")
      .sort({ createdAt: -1 });

    const merged = mergePaymentWithAccess(user, user.purchasedBatches || [], payments);
    return res.json({ success: true, data: merged });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Create Razorpay Order ─────────────────────────────────────────────────
router.post("/create-order", authMiddleware, async (req, res) => {
  if (!hasRazorKeys || !razorpay) {
    return res.status(503).json({ success: false, message: "Payment gateway not configured. Please contact support." });
  }
  try {
    const { amount, batchId } = req.body;
    if (!amount || !batchId) {
      return res.status(400).json({ success: false, message: "Amount and batchId are required." });
    }
    const [user, batch] = await Promise.all([
      Examinee.findById(req.userId),
      Batch.findById(batchId).populate("course"),
    ]);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }
    const alreadyPurchased = (user.purchasedBatches || []).some(
      (entry) =>
        String(entry.batch?._id || entry.batch) === String(batch._id) &&
        String(entry.accessStatus || "").toLowerCase() === "active"
    );
    if (alreadyPurchased) {
      return res.json({
        success: true,
        message: "Batch already unlocked for this user.",
        data: null,
      });
    }

    const course = await Course.findById(batch.course?._id || batch.course);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const finalAmount = resolveBatchAmount(batch, amount);
    const options = {
      amount: Math.round(Number(finalAmount) * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        description: "Welcome to Computer Excellence Academy! Complete your payment to confirm your enrollment.",
      },
    };
    const order = await razorpay.orders.create(options);
    const payment = await upsertPaymentJourney({
      user,
      batch,
      course,
      amount: finalAmount,
      originalAmount: Number(batch.price || finalAmount),
      discountAmount: Math.max(Number(batch.price || finalAmount) - Number(finalAmount), 0),
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      purchaseStage: "order_created",
      gatewayOrderId: order.id,
      notes: "Razorpay order created.",
    });

    return res.status(200).json({ success: true, order, payment: { _id: payment._id, purchaseStage: payment.purchaseStage } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Order creation failed." });
  }
});

router.post("/fail", authMiddleware, async (req, res) => {
  try {
    const { batchId, gatewayOrderId, reason = "Payment dismissed or failed by user." } = req.body || {};
    if (!batchId) {
      return res.status(400).json({ success: false, message: "batchId is required." });
    }

    const [user, batch] = await Promise.all([
      Examinee.findById(req.userId),
      Batch.findById(batchId).populate("course"),
    ]);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    const course = await Course.findById(batch.course?._id || batch.course);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const payment = await upsertPaymentJourney({
      user,
      batch,
      course,
      amount: resolveBatchAmount(batch),
      originalAmount: Number(batch.price || resolveBatchAmount(batch)),
      discountAmount: Math.max(Number(batch.price || 0) - resolveBatchAmount(batch), 0),
      paymentMethod: "razorpay",
      paymentStatus: "failed",
      purchaseStage: "payment_failed",
      gatewayOrderId: gatewayOrderId || "",
      notes: reason,
    });

    return res.json({ success: true, message: "Payment status updated as failed.", data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Verify Razorpay Payment & Grant Access ────────────────────────────────
router.post("/verify", async (req, res) => {
  if (!hasRazorKeys || !razorpay) {
    console.error("[Verify] Razorpay keys missing in environment.");
    return res.status(503).json({ success: false, message: "Payment gateway not configured. Please contact support." });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      batchId,
      amount,
      couponCode,
      couponId,
      originalAmount,
      discountAmount,
    } = req.body;

    console.log(`[Verify] Starting validation for User: ${userId}, Batch: ${batchId}`);

    if (!userId || !batchId) {
      console.warn("[Verify] Missing userId or batchId in request.");
      return res.status(400).json({ success: false, message: "userId and batchId are required." });
    }

    // Verify Razorpay signature
    const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error(`[Verify] Signature mismatch for Order: ${razorpay_order_id}`);
      return res.status(400).json({ success: false, message: "Payment verification failed. Invalid signature." });
    }

    const user = await Examinee.findById(userId);
    if (!user) {
      console.error(`[Verify] User NOT found: ${userId}`);
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const batch = await Batch.findById(batchId).populate("course");
    if (!batch) {
      console.error(`[Verify] Batch NOT found: ${batchId}`);
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    const course = await Course.findById(batch.course?._id || batch.course);
    if (!course) {
      console.error(`[Verify] Course NOT found for batch: ${batchId}`);
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Check if batch already assigned (idempotency)
    const existingEntry = (user.purchasedBatches || []).find(
      (item) => String(item.batch?._id || item.batch) === String(batch._id)
    );
    
    // SECURITY FIX: Check if payment already processed to prevent replay attacks
    const existingPayment = await Payment.findOne({
      transactionId: razorpay_payment_id,
      paymentStatus: "success",
    });

    if (existingPayment) {
      console.warn(`[Verify] Duplicate payment attempt detected: ${razorpay_payment_id}. Already processed.`);
      return res.status(400).json({ 
        success: false, 
        message: "This payment has already been verified. Please contact support if you need assistance." 
      });
    }

    if (existingEntry) {
      console.log(`[Verify] User ${userId} already has access to Batch ${batchId}. Activating...`);
      existingEntry.accessStatus = "active";
      existingEntry.accessType = "paid";
      await user.save();
      await upsertPaymentJourney({
        user,
        batch,
        course,
        amount: Number(amount) || Number(batch.discountPrice) || Number(batch.price),
        originalAmount: Number(originalAmount) || Number(batch.price) || Number(amount) || 0,
        discountAmount: Number(discountAmount) || 0,
        couponCode: couponCode || null,
        couponId: couponId || null,
        paymentMethod: "razorpay",
        paymentStatus: "success",
        purchaseStage: "access_granted",
        gatewayOrderId: razorpay_order_id || "",
        transactionId: razorpay_payment_id,
        notes: "Existing access refreshed after payment verification.",
      });
      return res.status(200).json({ success: true, message: "Payment verified. Batch already active.", data: existingEntry });
    }

    const finalAmount = Number(amount) || Number(batch.discountPrice) || Number(batch.price);

    const payment = await upsertPaymentJourney({
      user,
      batch,
      course,
      amount: finalAmount,
      originalAmount: Number(originalAmount) || Number(batch.price) || finalAmount,
      discountAmount: Number(discountAmount) || 0,
      couponCode: couponCode || null,
      couponId: couponId || null,
      paymentMethod: "razorpay",
      paymentStatus: "success",
      purchaseStage: "access_granted",
      gatewayOrderId: razorpay_order_id || "",
      transactionId: razorpay_payment_id,
      notes: "Razorpay payment verified successfully.",
    });

    // Grant Access using central helper
    user.purchasedBatches.push(
      buildPurchasedBatchEntry({
        batch,
        paymentId: payment._id,
        accessType: "paid",
        assignedByAdmin: false,
        enrolledAt: new Date()
      })
    );

    console.log("[Verify] Saving User with new batch...");
    await user.save();

    // Increment coupon usage
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
    }

    if (typeof batch.enrolledStudents === "number") {
      batch.enrolledStudents += 1;
      await batch.save();
    }

    try {
      const html = buildReceiptHtml({
        userName: user.name,
        courseName: course.title,
        batchName: batch.batchName,
        amount: finalAmount,
        transactionId: razorpay_payment_id,
        receiptNumber: payment.receiptNumber,
        couponCode: couponCode || null,
        date: new Date().toLocaleString(),
      });
      await sendEmail(user.email, "Payment Successful — Computer Excellence Academy", html);
    } catch (emailErr) {
      console.warn("[Verify] Email receipt failed, but payment succeeded.");
    }

    console.log(`[Verify] SUCCESS for User: ${userId}`);
    return res.status(201).json({
      success: true,
      message: "Payment verified and batch assigned.",
      data: payment,
    });
  } catch (error) {
    console.error("[Verify] CRITICAL ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error during payment verification." });
  }
});

module.exports = router;
