const gradients = [
  ["#2563eb", "#06b6d4"],
  ["#7c3aed", "#ec4899"],
  ["#0ea5e9", "#22c55e"],
  ["#f97316", "#ef4444"],
  ["#14b8a6", "#3b82f6"],
  ["#8b5cf6", "#22d3ee"],
];

const hashSeed = (seed = "") => {
  let hash = 0;
  const input = String(seed || "cea");
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const resolveThumbnailUrl = (item = {}) => {
  const thumb = item.thumbnail || item.batchId?.thumbnail || "";
  if (!thumb) return "";
  
  if (thumb.startsWith("http") || thumb.startsWith("blob:") || thumb.startsWith("data:")) {
    return thumb;
  }
  
  if (thumb.startsWith("uploads/") || !thumb.includes("://")) {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const cleanThumb = thumb.startsWith("/") ? thumb.substring(1) : thumb;
    return `${baseUrl}/${cleanThumb}`;
  }
  
  return thumb;
};

export const getFallbackGradient = (seed = "") => {
  const hash = hashSeed(seed);
  return gradients[hash % gradients.length];
};

export const getInitials = (title = "") => {
  const words = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!words.length) return "CEA";
  return words.map((word) => word[0]?.toUpperCase() || "").join("");
};

