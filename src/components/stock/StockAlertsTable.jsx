import { useEffect, useMemo, useState } from "react";
import { Table, Tag, Typography, Card, Select, Input, Space } from "antd";
import { getLowStockAlerts } from "../../services/stockService";

const { Text } = Typography;

export default function StockAlertsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [groupFilter, setGroupFilter] = useState();
  const [statusFilter, setStatusFilter] = useState();

  useEffect(() => {
    getLowStockAlerts()
      .then((data) => {
        console.log("API DATA:", data); // 👈 debug proof
        setRows(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ✅ GROUP OPTIONS (ANTD v5 SAFE) */
  const groupOptions = useMemo(() => {
    const unique = [...new Set(rows.map(r => r.group_name).filter(Boolean))];
    return unique.map(g => ({ label: g, value: g }));
  }, [rows]);

  /* ✅ FILTERED DATA */
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const matchSearch =
        !searchText ||
        r.item_name.toLowerCase().includes(searchText.toLowerCase());

      const matchGroup =
        !groupFilter || r.group_name === groupFilter;

      const matchStatus =
        !statusFilter || r.status === statusFilter;

      return matchSearch && matchGroup && matchStatus;
    });
  }, [rows, searchText, groupFilter, statusFilter]);

  const columns = [
    {
      title: "Item Name",
      dataIndex: "item_name",
      render: text => <Text strong>{text}</Text>
    },
    {
      title: "Group",
      dataIndex: "group_name"
    },
    {
      title: "Qty",
      dataIndex: "available_qty",
      align: "right",
      sorter: (a, b) => a.available_qty - b.available_qty,
      render: qty => (
        <Text
          type={
            qty === 0 ? "danger" :
            qty <= 10 ? "warning" :
            undefined
          }
        >
          {qty}
        </Text>
      )
    },
    {
      title: "Value (₹)",
      dataIndex: "available_value",
      align: "right",
      sorter: (a, b) => a.available_value - b.available_value,
      render: val => `₹${val.toLocaleString("en-IN")}`
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: status => {
        if (status === "OUT") return <Tag color="red">OUT</Tag>;
        if (status === "LOW") return <Tag color="orange">LOW</Tag>;
        return <Tag color="green">OK</Tag>;
      }
    }
  ];

  return (
    <Card title="📦 Stock Overview" bordered={false}>
      {/* 🔍 FILTER BAR */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Search item"
          allowClear
          style={{ width: 220 }}
          onChange={e => setSearchText(e.target.value)}
        />

        <Select
          allowClear
          placeholder="Select Group"
          style={{ width: 260 }}
          options={groupOptions}   // ✅ THIS IS THE KEY FIX
          onChange={setGroupFilter}
        />

        <Select
          allowClear
          placeholder="Stock Status"
          style={{ width: 180 }}
          options={[
            { label: "OK", value: "OK" },
            { label: "LOW", value: "LOW" },
            { label: "OUT", value: "OUT" }
          ]}
          onChange={setStatusFilter}
        />
      </Space>

      {/* 📊 TABLE */}
      <Table
        rowKey="guid"
        columns={columns}
        dataSource={filteredRows}
        loading={loading}
        pagination={{ pageSize: 12 }}
      />
    </Card>
  );
}
