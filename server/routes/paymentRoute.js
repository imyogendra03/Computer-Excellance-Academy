const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");
const Batch = require("../models/Batch");
const Course = require("../models/Course");
const Examinee = require("../models/Examinee");
const sendEmail = require("../utils/sendMail");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const generateReceiptNumber = () => {
  return `RCPT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Create payment and assign batch to user
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      batchId,
      paymentMethod,
      transactionId,
      amount,
      notes,
    } = req.body;

    if (!userId || !batchId) {
      return res.status(400).json({ message: "userId and batchId are required" });
    }

    const user = await Examinee.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const batch = await Batch.findById(batchId).populate("course");
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const course = await Course.findById(batch.course?._id || batch.course);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const alreadyPurchased = (user.purchasedBatches || []).some(
      (item) => String(item.batch) === String(batch._id)
    );

    if (alreadyPurchased) {
      return res.status(400).json({ message: "Batch already purchased" });
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
      paymentMethod: paymentMethod || "manual",
      transactionId: transactionId || generateTransactionId(),
      receiptNumber: generateReceiptNumber(),
      paymentStatus: "success",
      paidAt: new Date(),
      notes: notes || "",
    });

    await payment.save();

    user.purchasedBatches.push({
      batch: batch._id,
      course: course._id,
      paymentId: payment._id,
      accessStatus: "active",
      enrolledAt: new Date(),
    });

    await user.save();

    if (typeof batch.enrolledStudents === "number") {
      batch.enrolledStudents += 1;
      await batch.save();
    }

    const html = `
      <div style="font-family: Arial, sans-serif; background: #f5f7fb; padding: 30px;">
        <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 24px; color: white; text-align: center;">
            <h2 style="margin: 0;">Payment Successful</h2>
            <p style="margin: 8px 0 0;">Your batch access has been activated</p>
          </div>

          <div style="padding: 24px;">
            <p>Dear <strong>${user.name || "Student"}</strong>,</p>
            <p>Your payment has been received successfully. Your purchased batch is now active in your dashboard.</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 18px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Course</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${course.title}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Batch</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${batch.batchName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Amount</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">Rs. ${finalAmount}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Transaction ID</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${payment.transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Receipt Number</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${payment.receiptNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Date</strong></td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(payment.paidAt).toLocaleString()}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; text-align: center;">
              <a href="http://localhost:5173/userdash/my-batches" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 22px; border-radius: 10px;">
                Open My Batches
              </a>
            </div>

            <p style="margin-top: 24px;">Thank you,<br /><strong>Computer Excellence Academy</strong></p>
          </div>
        </div>
      </div>
    `;

    try {
      await sendEmail(
        user.email,
        "Payment Successful - Batch Enrollment Receipt",
        html
      );
    } catch (mailError) {
      console.error("Payment receipt email error:", mailError);
    }

    return res.status(201).json({
      success: true,
      message: "Payment successful and batch assigned",
      data: payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user")
      .populate("course")
      .populate("batch")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get payments by user
router.get("/user/:userId", async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.params.userId })
      .populate("course")
      .populate("batch")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get user payments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


// Create Razorpay Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, batchId } = req.body;

    if (!amount || !batchId) {
      return res.status(400).json({ message: "Amount and batchId required" });
    }

    const options = {
      amount: Number(amount) * 100, // paise mein
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return res.status(500).json({ message: "Order creation failed" });
  }
});

// Verify Razorpay Payment
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      batchId,
      amount,
    } = req.body;

    // Signature verify karo
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .toString("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Payment save karo — existing POST "/" logic use karke
    const user = await Examinee.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const batch = await Batch.findById(batchId).populate("course");
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const course = await Course.findById(batch.course?._id || batch.course);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const alreadyPurchased = (user.purchasedBatches || []).some(
      (item) => String(item.batch) === String(batch._id)
    );
    if (alreadyPurchased) {
      return res.status(400).json({ message: "Batch already purchased" });
    }

    const finalAmount = Number(amount) || Number(batch.discountPrice) || Number(batch.price);

    const payment = new Payment({
      user: user._id,
      course: course._id,
      batch: batch._id,
      amount: finalAmount,
      paymentMethod: "razorpay",
      transactionId: razorpay_payment_id,
      receiptNumber: generateReceiptNumber(),
      paymentStatus: "success",
      paidAt: new Date(),
    });

    await payment.save();

    user.purchasedBatches.push({
      batch: batch._id,
      course: course._id,
      paymentId: payment._id,
      accessStatus: "active",
      enrolledAt: new Date(),
    });
    await user.save();

    if (typeof batch.enrolledStudents === "number") {
      batch.enrolledStudents += 1;
      await batch.save();
    }

    // Email receipt bhejo
    const html = `
      <div style="font-family: Arial, sans-serif; background: #f5f7fb; padding: 30px;">
        <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 24px; color: white; text-align: center;">
            <h2 style="margin: 0;">Payment Successful 🎉</h2>
            <p style="margin: 8px 0 0;">Your batch access has been activated</p>
          </div>
          <div style="padding: 24px;">
            <p>Dear <strong>${user.name || "Student"}</strong>,</p>
            <p>Your payment via Razorpay was successful!</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 18px;">
              <tr><td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Course</strong></td><td style="padding: 10px; border: 1px solid #e5e7eb;">${course.title}</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Batch</strong></td><td style="padding: 10px; border: 1px solid #e5e7eb;">${batch.batchName}</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Amount</strong></td><td style="padding: 10px; border: 1px solid #e5e7eb;">Rs. ${finalAmount}</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Transaction ID</strong></td><td style="padding: 10px; border: 1px solid #e5e7eb;">${razorpay_payment_id}</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Receipt No.</strong></td><td style="padding: 10px; border: 1px solid #e5e7eb;">${payment.receiptNumber}</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Date</strong></td><td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date().toLocaleString()}</td></tr>
            </table>
            <p style="margin-top: 24px;">Thank you,<br/><strong>Computer Excellence Academy</strong></p>
          </div>
        </div>
      </div>
    `;

    try {
      await sendEmail(user.email, "Payment Successful - Receipt", html);
    } catch (mailError) {
      console.error("Email error:", mailError);
    }

    return res.status(201).json({
      success: true,
      message: "Payment verified and batch assigned",
      data: payment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
