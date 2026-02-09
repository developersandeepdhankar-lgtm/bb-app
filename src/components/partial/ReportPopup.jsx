// src/components/partial/ReportPopup.jsx
import React from "react";
import PopUp from "../common/PopUp";
import GenericTable from "../partial/GenericTable";
import { Select } from "antd";


const ReportPopup = ({
  open,
  title,
  summary,
  summaryConfig,
  filters,
  columns,
  data,
  loading,
  page,
  totalRows,
  onFilterChange,
  onPageChange,
  onClose,
}) => {
  return (
    <PopUp popup={open} title={title} onClose={onClose}>
      
      {/* 🔥 SUMMARY */}
      <div className="row px-3 py-3 border-bottom">
        {summaryConfig.map((item, i) => (
          <div className="col-md-6" key={i}>
            <div className="fw-semibold text-muted">
              {item.label}
            </div>
            <div className={`fs-4 fw-bold ${item.color || "text-primary"}`}>
              {item.format
                ? item.format(summary?.[item.key])
                : summary?.[item.key]}
            </div>
          </div>
        ))}
      </div>

      {/* 🔍 FILTERS */}
      <div className="d-flex gap-2 p-3 border-bottom">
        {filters.map((f, i) => {
          if (f.type === "search") {
            return (
              <input
                key={i}
                className="form-control"
                placeholder={f.placeholder}
                value={f.value}
                onChange={(e) =>
                  onFilterChange(f.key, e.target.value)
                }
              />
            );
          }

          if (f.type === "date") {
            return (
              <input
                key={i}
                type="date"
                className="form-control"
                value={f.value}
                onChange={(e) =>
                  onFilterChange(f.key, e.target.value)
                }
              />
            );
          }

          if (f.type === "select") {
            return (
             
              <Select
                key={i}
                style={{ width: "100%" }}
                value={f.value || undefined}
                placeholder={f.placeholder || "Please select"}
                options={f.options}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                allowClear
                disabled={f.disabled}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}  // ✅ FIX
                onChange={(value) => onFilterChange(f.key, value)}
              />

             
            );
          }

          return null;
        })}
      </div>

      {/* 📊 TABLE */}
      <GenericTable
        columns={columns}
        data={data}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          total: totalRows,
          onChange: onPageChange,
        }}
      />
    </PopUp>
  );
};

export default ReportPopup;
