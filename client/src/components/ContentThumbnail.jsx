import React from "react";
import { getFallbackGradient, getInitials, resolveThumbnailUrl } from "../utils/thumbnail";

const ContentThumbnail = ({
  item,
  title,
  className = "",
  style = {},
  showLabel = true,
}) => {
  const resolvedTitle = title || item?.title || "Learning Resource";
  const imageUrl = resolveThumbnailUrl(item || {});
  const [colorA, colorB] = getFallbackGradient(`${resolvedTitle}-${item?.type || ""}`);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={resolvedTitle}
        className={className}
        style={{ objectFit: "cover", ...style }}
      />
    );
  }

  return (
    <div
      className={`animated-thumb-fallback ${className}`}
      style={{
        "--thumb-a": colorA,
        "--thumb-b": colorB,
        ...style,
      }}
      aria-label={resolvedTitle}
    >
      {showLabel ? <span>{getInitials(resolvedTitle)}</span> : null}
    </div>
  );
};

export default ContentThumbnail;

