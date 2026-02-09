import { useEffect } from "react";

export default function AutoPopupModal({ popup, title, children, onClose }) {
  useEffect(() => {
    if (popup) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [popup]);

  if (!popup) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />

      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-xl" style={{ maxWidth: "96%" }}>
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body p-0">{children}</div>

          </div>
        </div>
      </div>
    </>
  );
}
