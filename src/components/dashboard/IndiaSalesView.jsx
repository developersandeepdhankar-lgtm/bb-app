import { useEffect, useState } from "react";
import { Table, Progress } from "antd";
import IndiaMap from "./IndiaMap";
import { getIndiaSalesMap } from "../../services/locationService";
import "./IndiaSalesView.css";
import { formatIndianCurrency } from "../../utils/numberFormat";

export default function IndiaSalesView({ onRegionClick }) {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getIndiaSalesMap()
      .then((res) => setStates(res.states || []))
      .finally(() => setLoading(false));
  }, []);

  /* ===========================
     TABLE DATA
  =========================== */
  const tableData = states.map((s, i) => {
    const target = Number(s.target || 0);
    const sales = Number(s.completed_sales || 0);
    const balance = target - sales;
    const percent = target ? Math.round((sales / target) * 100) : 0;

    return {
      key: s.id,
      sr: i + 1,
      state: s.name,
      target,
      sales,
      balance,
      percent,
    };
  });

  /* ===========================
     TABLE COLUMNS
  =========================== */
  const columns = [
    {
      title: "Sr.",
      dataIndex: "sr",
      width: 50,
      align: "center",
      fixed: "left",
    },
    {
      title: "State",
      dataIndex: "state",
      width: 80, // ✅ reduced width
      render: (v) => (
        <span className="state-name" title={v}>
          {v}
        </span>
      ),
    },
    {
      title: "Target",
      dataIndex: "target",
      align: "right",
       width: 80,
      render: (v) => (
        <span className="money">{formatIndianCurrency(v)}</span>
      ),
    },
    {
      title: "Sales",
      dataIndex: "sales",
      align: "right",
       width: 80,
      render: (v) => (
        <span className="money sales">
          {formatIndianCurrency(v)}
        </span>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      align: "right",
       width: 80,
      render: (v) => (
        <span className={`money ${v <= 0 ? "positive" : "negative"}`}>
          {formatIndianCurrency(v)}
        </span>
      ),
    },
    {
      title: "Achievement",
      dataIndex: "percent",
      width: 140, // ✅ reduced
      render: (v) => (
        <div className="progress-cell">
          <Progress
            percent={v}
            size="small"
            showInfo={false}
            strokeColor={
              v >= 100
                ? "#1b8f2f"
                : v >= 75
                ? "#4fd65a"
                : v >= 50
                ? "#9bdc9b"
                : "#f5a5a5"
            }
          />
          <span className="percent-text">{v}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="row g-3">
      {/* ================= MAP CARD ================= */}
      <div className="col-lg-6">
        <div className="card rounded-4 h-100">
          <div className="card-body">
            <h6 className="mb-3">Regional Overview</h6>
            <IndiaMap />
          </div>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="col-lg-6">
        <div className="card rounded-4 h-100">
          <div className="card-body">
            <h6 className="mb-3">State-wise Target vs Sales</h6>

            <Table
              columns={columns}
              dataSource={tableData}
              loading={loading}
              pagination={false}
              size="small"
              scroll={{ x: 760 }}
              className="sales-ant-table"
              onRow={(row) => ({
                onClick: () => onRegionClick?.(row.state),
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
