import { useEffect, useState } from "react";
import { getItemSalesHistory } from "../../services/stockService";
import { formatExactIndianCurrency } from "../../utils/numberFormat";

export default function ItemSalesHistory({ itemGuid }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (itemGuid) {
      getItemSalesHistory(itemGuid).then(setRows);
    }
  }, [itemGuid]);

  if (!itemGuid) return <p>Select an item</p>;

  return (
    <table className="table table-sm">
      <thead>
        <tr>a
          <th>Date</th>
          <th>Voucher</th>
          <th>Qty</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.date}</td>
            <td>{r.voucher_no}</td>
            <td>{r.qty}</td>
            <td>{formatExactIndianCurrency(r.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
