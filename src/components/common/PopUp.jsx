// src/components/common/PopUp.jsx
import React from "react";

const PopUp = ({ popup, title, onClose, children }) => {
  if (!popup) return null;

  return (
    <div className="modal fade show d-block" style={{ background: "#00000066" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
