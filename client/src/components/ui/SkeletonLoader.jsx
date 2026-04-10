import React from "react";

export const SkeletonCard = ({ count = 3, dark = true }) => {
  const baseClass = dark ? "app-skeleton-dark" : "app-skeleton";
  return (
    <div className="row g-4">
      {[...Array(count)].map((_, i) => (
        <div className="col-lg-4 col-md-6" key={i}>
          <div className={`${baseClass} app-skeleton-card p-4 d-flex flex-column justify-content-end`}>
             <div className={`${baseClass} app-skeleton-title w-75`} style={{ opacity: 0.3 }}></div>
             <div className={`${baseClass} app-skeleton-text w-50`} style={{ opacity: 0.2 }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 5, dark = false }) => {
  const baseClass = dark ? "app-skeleton-dark" : "app-skeleton";
  return (
    <div className="w-100 mt-4">
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              {[...Array(cols)].map((_, i) => (
                <th key={i}><div className={`${baseClass} app-skeleton-text`} style={{ width: "80px", height: "12px" }}></div></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, i) => (
              <tr key={i}>
                {[...Array(cols)].map((_, j) => (
                  <td key={j}><div className={`${baseClass} app-skeleton-text`} style={{ width: j === 1 ? "150px" : "100px", height: "10px", opacity: 0.6 }}></div></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SkeletonStats = ({ count = 3, dark = false }) => {
  const baseClass = dark ? "app-skeleton-dark" : "app-skeleton";
  return (
    <div className="row g-4 mb-4">
      {[...Array(count)].map((_, i) => (
        <div className="col-md-4" key={i}>
          <div className={`${baseClass} p-4 w-100`} style={{ height: "100px", borderRadius: "22px" }}></div>
        </div>
      ))}
    </div>
  );
};
