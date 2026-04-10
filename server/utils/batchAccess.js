const parseDurationToDays = (durationText = "") => {
  const raw = String(durationText || "").trim().toLowerCase();
  if (!raw) return null;

  const match = raw.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/i);
  if (!match) return null;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith("day")) return value;
  if (unit.startsWith("week")) return value * 7;
  if (unit.startsWith("month")) return value * 30;
  if (unit.startsWith("year")) return value * 365;
  return null;
};

const addDays = (dateValue, days) => {
  const base = new Date(dateValue);
  if (Number.isNaN(base.getTime()) || !days) return null;
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const getBatchExpiryDate = (batch, accessStart = new Date()) => {
  if (batch?.endDate) {
    const endDate = new Date(batch.endDate);
    if (!Number.isNaN(endDate.getTime())) {
      return endDate;
    }
  }

  const durationDays = parseDurationToDays(batch?.duration);
  if (!durationDays) {
    return null;
  }

  return addDays(accessStart, durationDays);
};

const getResolvedAccessStatus = (entry, batch) => {
  const now = new Date();
  const expiry = entry?.accessExpiresAt ? new Date(entry.accessExpiresAt) : null;

  if (!batch) {
    return "inactive";
  }

  if (batch?.status === "inactive" || batch?.accessStatus === "closed") {
    return "inactive";
  }

  if (expiry && !Number.isNaN(expiry.getTime()) && expiry < now) {
    return "expired";
  }

  if (entry?.accessStatus === "inactive") {
    return "inactive";
  }

  return "active";
};

const buildPurchasedBatchEntry = ({
  batch,
  paymentId = null,
  accessType = "paid",
  assignedByAdmin = false,
  enrolledAt = new Date(),
}) => {
  const accessStartsAt = new Date(enrolledAt);
  return {
    batch: batch._id,
    course: batch.course?._id || batch.course,
    paymentId,
    accessStatus: "active",
    accessType,
    enrolledAt: accessStartsAt,
    accessStartsAt,
    accessExpiresAt: getBatchExpiryDate(batch, accessStartsAt),
    assignedByAdmin,
  };
};

const syncPurchasedBatches = async (user) => {
  let updated = false;

  const normalized = await Promise.all(
    (user.purchasedBatches || []).map(async (entry) => {
      if (entry.accessType === "paid") {
        if (entry.accessStatus !== "active") {
          entry.accessStatus = "active";
          updated = true;
        }
        if (entry.accessExpiresAt) {
          entry.accessExpiresAt = null;
          updated = true;
        }
      }

      const batch = entry.batch?._id ? entry.batch : null;
      const resolvedStatus = getResolvedAccessStatus(entry, batch);

      if (resolvedStatus !== entry.accessStatus) {
        entry.accessStatus = resolvedStatus;
        updated = true;
      }

      return entry;
    })
  );

  user.purchasedBatches = normalized;
  if (updated) {
    await user.save();
  }

  return user.purchasedBatches;
};

module.exports = {
  buildPurchasedBatchEntry,
  getResolvedAccessStatus,
  getBatchExpiryDate,
  syncPurchasedBatches,
};
