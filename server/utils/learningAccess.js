const Examinee = require("../models/Examinee");
const Payment = require("../models/Payment");

const hasActiveBatchAccess = async (userId, batchId) => {
  if (!userId || !batchId) {
    return false;
  }

  const user = await Examinee.findById(userId).select("purchasedBatches");
  if (!user) {
    return false;
  }

  const now = Date.now();

  return (user.purchasedBatches || []).some((item) => {
    const batchMatch = String(item.batch) === String(batchId);
    const statusMatch = !item.accessStatus || item.accessStatus === "active";
    const notExpired =
      !item.accessExpiresAt || new Date(item.accessExpiresAt).getTime() >= now;

    return batchMatch && statusMatch && notExpired;
  }) || Boolean(
    await Payment.exists({
      user: userId,
      batch: batchId,
      paymentStatus: "success",
    })
  );
};

module.exports = {
  hasActiveBatchAccess,
};
