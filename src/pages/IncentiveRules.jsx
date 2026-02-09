import { useEffect, useState } from "react";
import {
  Table,
  Space,
  Popconfirm,
  message,
  Card,
  Button,
  Form,
  InputNumber,
} from "antd";
import { PlusOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";

import {
  getIncentiveRules,
  createIncentiveRule,
  updateIncentiveRule,
  deleteIncentiveRule,
} from "../services/incentiveRules";

import IconActionButton from "../components/partial/ActionButtons";

/* =====================================================
   MAIN COMPONENT
===================================================== */
const IncentiveRules = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  /* ---------------- FETCH ---------------- */
  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await getIncentiveRules();
      setData(res);
    } catch {
      message.error("Failed to load incentive rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  /* ---------------- ADD NEW INLINE ROW ---------------- */
  const addNewRow = () => {
    if (editingId) {
      message.warning("Finish current edit first");
      return;
    }

    const newRow = {
      id: "NEW",
      min_amount: 0,
      max_amount: null,
      incentive_percent: 0,
      isNew: true,
    };

    setData([newRow, ...data]);
    setEditingId("NEW");

    form.setFieldsValue(newRow);
  };

  /* ---------------- INLINE EDIT ---------------- */
  const isEditing = (record) => record.id === editingId;

  const saveInline = async (record) => {
    try {
      const values = await form.validateFields();

      if (record.isNew) {
        await createIncentiveRule(values);
        message.success("Incentive rule created");
      } else {
        await updateIncentiveRule(record.id, values);
        message.success("Incentive rule updated");
      }

      setEditingId(null);
      fetchRules();
    } catch (err) {
      message.error(err.response?.data?.detail || "Save failed");
    }
  };

  const cancelInline = () => {
    if (editingId === "NEW") {
      setData(data.filter((r) => r.id !== "NEW"));
    }
    setEditingId(null);
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteIncentiveRule(id);
      message.success("Incentive rule deleted");
      fetchRules();
    } catch (err) {
      message.error(err.response?.data?.detail || "Delete failed");
    }
  };

  /* ---------------- EDITABLE CELL ---------------- */
  const EditableCell = ({
    editing,
    dataIndex,
    title,
    children,
    ...restProps
  }) => (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            { required: dataIndex !== "max_amount", message: `Enter ${title}` },
            ...(dataIndex !== "max_amount"
              ? [{ type: "number", min: 0 }]
              : []),
          ]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );

  /* ---------------- COLUMNS ---------------- */
  const columns = [
    {
      title: "Sr. No",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Min Amount",
      dataIndex: "min_amount",
      editable: true,
    },
    {
      title: "Max Amount",
      dataIndex: "max_amount",
      editable: true,
      render: (v) => (v === null ? "∞" : v),
    },
    {
      title: "Incentive %",
      dataIndex: "incentive_percent",
      editable: true,
      render: (v) => `${v}%`,
    },
    {
      title: "Action",
      width: 160,
      render: (_, record) => {
        const editing = isEditing(record);

        return editing ? (
          <Space>
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => saveInline(record)}
            >
              Save
            </Button>
            <Button
              type="link"
              danger
              icon={<CloseOutlined />}
              onClick={cancelInline}
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Space>
            <IconActionButton
              type="edit"
              title="Edit"
              onClick={() => {
                setEditingId(record.id);
                form.setFieldsValue(record);
              }}
            />

            <Popconfirm
              title="Delete this rule?"
              onConfirm={() => handleDelete(record.id)}
            >
              <IconActionButton type="delete" danger />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) =>
    col.editable
      ? {
          ...col,
          onCell: (record) => ({
            record,
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
          }),
        }
      : col
  );

  /* ---------------- RENDER ---------------- */
  return (
    <Card
      title="Incentive Rules"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ borderRadius: 20 }}
          onClick={addNewRow}
        >
          Add New Rule
        </Button>
      }
    >
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          rowKey="id"
          columns={mergedColumns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />
      </Form>
    </Card>
  );
};

export default IncentiveRules;
