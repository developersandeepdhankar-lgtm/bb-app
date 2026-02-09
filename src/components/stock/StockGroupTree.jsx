import { useEffect, useState } from "react";
import { Table, Tag, Typography, Spin } from "antd";
import { FolderOpenOutlined, InboxOutlined } from "@ant-design/icons";
import { getStockGroupTree } from "../../services/stockService";

const { Text } = Typography;

/* ------------------------------
   Convert API tree → AntD format
--------------------------------*/
function transformTree(nodes) {
  return nodes.map(node => {
    const isGroup = node.type === "GROUP";

    return {
      key: node.guid,
      name: node.name,
      qty: isGroup ? node.total_qty : node.available_qty,
      value: isGroup ? node.total_value : node.available_value,
      status: node.status || "OK",
      type: node.type,
      children: node.children?.length
        ? transformTree(node.children)
        : undefined
    };
  });
}

export default function StockTreeTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStockGroupTree()
      .then(res => {
        setData(transformTree(Array.isArray(res) ? res : []));
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: "Item / Group",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {record.type === "GROUP" ? (
            <FolderOpenOutlined style={{ color: "#2563eb" }} />
          ) : (
            <InboxOutlined style={{ color: "#6b7280" }} />
          )}
          <Text strong={record.type === "GROUP"}>{text}</Text>
        </div>
      )
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      key: "qty",
      align: "right",
      width: 140,
      sorter: (a, b) => (a.qty || 0) - (b.qty || 0),
      render: (qty, record) => (
        <Text
          type={
            record.status === "OUT"
              ? "danger"
              : record.status === "LOW"
              ? "warning"
              : undefined
          }
        >
          {qty?.toLocaleString()}
        </Text>
      )
    },
    {
      title: "Value (₹)",
      dataIndex: "value",
      key: "value",
      align: "right",
      width: 160,
      sorter: (a, b) => (a.value || 0) - (b.value || 0),
      render: value => (
        <Text>
          ₹{(value || 0).toLocaleString("en-IN")}
        </Text>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 140,
      render: status => {
        if (status === "OUT") return <Tag color="red">OUT</Tag>;
        if (status === "LOW") return <Tag color="orange">LOW</Tag>;
        return <Tag color="green">OK</Tag>;
      }
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      size="middle"
      bordered
      sticky
      expandable={{
        defaultExpandAllRows: false
      }}
      rowClassName={record =>
        record.type === "GROUP" ? "row-group" : "row-item"
      }
    />
  );
}
