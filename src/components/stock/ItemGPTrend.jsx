import { useEffect, useState } from "react";
import { getItemGPTrend } from "../../services/stockService";

export default function ItemGPTrend({ itemGuid }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemGuid) return;
    loadData();
  }, [itemGuid]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getItemGPTrend(itemGuid);
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  if (!itemGuid) return <div>Select an item to view GP</div>;
  if (loading) return <div>Loading GP…</div>;
  if (!rows.length) return <div>No GP data found</div>;

  return (
    <table className="table table-sm table-bordered">
      <thead className="table-light">
        <tr>
          <th>Date</th>
          <th className="text-end">Sales ₹</th>
          <th className="text-end">Cost ₹</th>
          <th className="text-end">GP ₹</th>
          <th className="text-end">GP %</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.date}</td>
            <td className="text-end">{r.sales.toLocaleString("en-IN")}</td>
            <td className="text-end">{r.cost.toLocaleString("en-IN")}</td>
            <td className="text-end">{r.gp.toLocaleString("en-IN")}</td>
            <td className="text-end">{r.gp_percent}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
