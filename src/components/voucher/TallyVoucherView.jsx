import React from "react";
import PopUp from "../common/PopUp";
import { formatExactIndianCurrency } from "../../utils/numberFormat";

const TallyVoucherView = ({ open, data, onClose }) => {
  if (!open || !data) return null;

  const party = data.ledgers.find(l => l.type === "Dr");
  const credits = data.ledgers.filter(l => l.type === "Cr");

  return (
    <PopUp
      popup={open}
      title={`Sales Voucher : ${data.voucher.voucher_number}`}
      onClose={onClose}
    >
      {/* OUTER CONTAINER */}
      <div className="voucher-ui print-area">
        {/* VOUCHER PAPER */}
        <div className="voucher-sheet">

          {/* ================= HEADER ================= */}
          <div className="voucher-header">
            <div>
              <div className="voucher-date">
                <b>Date:</b> {data.voucher.voucher_date}
              </div>
              <div className="voucher-narration">
                <b>Narration:</b>{" "}
                {data.voucher.narration || "—"}
              </div>
            </div>
          </div>

          {/* ================= LEDGERS ================= */}
          <div className="voucher-section">
            <div className="voucher-section-title">
              Particulars
            </div>

            <table className="voucher-table">
              <thead>
                <tr>
                  <th>Ledger</th>
                  <th className="text-end">Debit</th>
                  <th className="text-end">Credit</th>
                </tr>
              </thead>
              <tbody>
                {party && (
                  <tr className="ledger-party">
                    <td>{party.ledger_name}</td>
                    <td className="text-end">
                      {formatExactIndianCurrency(party.abs_amount)}
                    </td>
                    <td className="text-end">—</td>
                  </tr>
                )}

                {credits.map((c, i) => (
                  <tr key={i}>
                    <td className="ledger-child">
                      {c.ledger_name}
                    </td>
                    <td className="text-end">—</td>
                    <td className="text-end">
                      {formatExactIndianCurrency(c.abs_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= ITEMS ================= */}
          <div className="voucher-section">
            <div className="voucher-section-title">
              Stock Item Details
            </div>

            <table className="voucher-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th className="text-end">Rate</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">GP</th>
                  <th className="text-end">GP %</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((i, idx) => (
                  <tr
                    key={idx}
                    className={i.negative_stock ? "negative-row" : ""}
                  >
                    <td>
                      {i.item_name}
                      {i.negative_stock && (
                        <span className="badge-negative">
                          Negative Stock
                        </span>
                      )}
                    </td>
                    <td>{i.quantity}</td>
                    <td>{i.unit}</td>
                    <td className="text-end">
                      {formatExactIndianCurrency(i.rate)}
                    </td>
                    <td className="text-end">
                      {formatExactIndianCurrency(i.amount)}
                    </td>
                    <td className="text-end">
                      {formatExactIndianCurrency(i.gp)}
                    </td>
                    <td className="text-end">
                      {i.gp_percent} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="voucher-summary">
            <div className="summary-row">
              <span>Sales Value</span>
              <span>
                {formatExactIndianCurrency(
                  data.gp_summary.sales_value
                )}
              </span>
            </div>

            <div className="summary-row">
              <span>Cost Value</span>
              <span>
                {formatExactIndianCurrency(
                  data.gp_summary.cost_value
                )}
              </span>
            </div>

            <div className="summary-row summary-strong">
              <span>Gross Profit</span>
              <span>
                {formatExactIndianCurrency(
                  data.gp_summary.gross_profit
                )}
              </span>
            </div>

            <div className="summary-row summary-strong">
              <span>GP %</span>
              <span>
                {data.gp_summary.gp_percent} %
              </span>
            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="voucher-footer">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => window.print()}
            >
              Print Voucher
            </button>
          </div>

        </div>
      </div>
    </PopUp>
  );
};

export default TallyVoucherView;
