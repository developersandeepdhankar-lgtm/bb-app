import { useEffect, useState } from "react";
import { Table, Typography, Tag, Card } from "antd";
import { getStockAgeing } from "../../services/stockService";

const { Text } = Typography;

export default function StockAgeingTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStockAgeing()
      .then(res => {
        setData(buildTree(res || []));
      })
      .finally(() => setLoading(false));
  }, []);

  // -----------------------------------------
  // Build GROUP → ITEM tree
  // -----------------------------------------
  function buildTree(rows) {
    const groups = {};

    rows.forEach(r => {
      const group = r.group_name || "Ungrouped";

      if (!groups[group]) {
        groups[group] = {
          key: group,
          group_name: group,
          age_0_30: 0,
          age_31_60: 0,
          age_60_plus: 0,
          children: []
        };
      }

      groups[group].children.push({
        key: r.item_name,
        item_name: r.item_name,
        age_0_30: r.age_0_30,
        age_31_60: r.age_31_60,
        age_60_plus: r.age_60_plus
      });

      groups[group].age_0_30 += r.age_0_30;
      groups[group].age_31_60 += r.age_31_60;
      groups[group].age_60_plus += r.age_60_plus;
    });

    return Object.values(groups);
  }

  // -----------------------------------------
  // Table columns
  // -----------------------------------------
  const columns = [
    {
      title: "Item / Group",
      dataIndex: "item_name",
      key: "name",
      fixed: "left",
      width: 300,
      render: (text, record) =>
        record.children ? (
          <Text strong>{record.group_name}</Text>
        ) : (
          <Text>{text}</Text>
        )
    },
    {
      title: "0 – 30 Days",
      dataIndex: "age_0_30",
      align: "right",
      render: v => formatQty(v)
    },
    {
      title: "31 – 60 Days",
      dataIndex: "age_31_60",
      align: "right",
      render: v => formatQty(v)
    },
    {
      title: "60+ Days",
      dataIndex: "age_60_plus",
      align: "right",
      render: v => formatQty(v, true)
    }
  ];

  function formatQty(v, danger = false) {
    if (!v) return <Text type="secondary">0</Text>;
    return (
      <Text type={danger ? "danger" : undefined}>
        {v.toLocaleString()}
      </Text>
    );
  }

  return (
    <Card
      title="Stock Ageing Report"
      bordered={false}
      style={{ borderRadius: 12 }}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        expandable={{
          defaultExpandAllRows: false
        }}
        pagination={false}
        size="middle"
        scroll={{ x: 900, y: 500 }}
        rowClassName={(record) =>
          record.children ? "age-group-row" : "age-item-row"
        }
      />
    </Card>
  );
}
