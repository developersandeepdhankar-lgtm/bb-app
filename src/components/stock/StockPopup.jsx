import { useEffect, useState } from "react";
import PopUp from "../common/PopUp";

import StockGroupTree from "./StockGroupTree";
import StockAgeingTable from "./StockAgeingTable";
import StockAlertsTable from "./StockAlertsTable";
import ItemGPTrend from "./ItemGPTrend";
import ItemSalesHistory from "./ItemSalesHistory";

const tabs = [
  { key: "groups", label: "📦 Stock Groups" },
  { key: "alerts", label: "📦 Stock Inventory" },
  { key: "ageing", label: "⏳ Stock Ageing" },
  { key: "gp", label: "📊 Item GP" },
  { key: "sales", label: "🔁 Item Sales" },
];

export default function StockPopup({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("groups");
  const [selectedItem, setSelectedItem] = useState(null);

  if (!open) return null;

  return (
    <PopUp popup={open} title="Stock Analysis" onClose={onClose}>
      <div className="p-3">

        {/* Tabs */}
        <ul className="nav nav-tabs mb-3">
          {tabs.map(t => (
            <li key={t.key} className="nav-item">
              <button
                className={`nav-link ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Content */}
        {activeTab === "groups" && (
          <StockGroupTree onSelectItem={setSelectedItem} />
        )}

        {activeTab === "alerts" && (
          <StockAlertsTable />
        )}

        {activeTab === "ageing" && (
          <StockAgeingTable />
        )}

        {activeTab === "gp" && (
          <ItemGPTrend itemGuid={selectedItem} />
        )}

        {activeTab === "sales" && (
          <ItemSalesHistory itemGuid={selectedItem} />
        )}
      </div>
    </PopUp>
  );
}
