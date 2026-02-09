import { useEffect, useState } from "react";
import {
  Table,
  Space,
  Popconfirm,
  message,
  Card,
  Button,
  Form,
  Popover,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { getRoles, createRole, deleteRole } from "../services/roleService";
import IconActionButton from "../components/partial/ActionButtons";

import FormInput from "../components/form/FormInput";

const Role = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- ADD ROLE POPOVER ---------------- */
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  /* ---------------- FETCH ROLES ---------------- */
  const fetchRoles = async () => {
    setLoading(true);
    try {
      setData(await getRoles());
    } catch {
      message.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  /* ---------------- CREATE ROLE ---------------- */
  const submit = async (values) => {
    try {
      setSaving(true);
      await createRole(values);
      message.success("Role created");
      form.resetFields();
      setPopoverOpen(false);
      fetchRoles();
    } catch (err) {
      message.error(err.response?.data?.detail || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteRole(id);
      message.success("Role deleted");
      fetchRoles();
    } catch (err) {
      message.error(err.response?.data?.detail || "Delete failed");
    }
  };

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    { title: "Sr. No", render: (_, __, i) => i + 1 },
    { title: "Role Name", dataIndex: "name" },
    { title: "Role Code", dataIndex: "code" },
    {
      title: "Action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Delete this role?"
            onConfirm={() => handleDelete(record.id)}
          >
            <IconActionButton type="delete" danger title="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ---------------- SMALL FLOATING FORM ---------------- */
  const popoverContent = (
    <div
      style={{
        width: 230,
        padding: "6px 8px",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
        onFinish={submit}
        style={{ marginTop: -4 }}
      >
        <FormInput
          name="name"
          label="Role Name"
          rules={[{ required: true }]}
        />

        <FormInput
          name="code"
          label="Role Code"
          rules={[{ required: true }]}
        />

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            size="small"
            loading={saving}
            style={{
              background: "#6C50BF",
              borderRadius: 6,
              minWidth: 65,
            }}
          >
            Save
          </Button>

          <Button
            size="small"
            onClick={() => {
              form.resetFields();
              setPopoverOpen(false);
            }}
          >
            ✕
          </Button>
        </div>
      </Form>
    </div>
  );

  return (
    <Card
      title="Role Master"
      extra={
        <Popover
          content={popoverContent}
          trigger="click"
          placement="bottomRight"
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
        >
          {/* -------- ANIMATED ADD BUTTON -------- */}
          <Button
            type="primary"
            size="small"
            icon={
              <PlusOutlined
                style={{
                  transition: "transform 0.25s ease",
                  transform: popoverOpen
                    ? "rotate(45deg)"
                    : "rotate(0deg)",
                }}
              />
            }
            style={{
              borderRadius: 16,
              background: "#6C50BF",
              transition:
                "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(108, 80, 191, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Add
          </Button>
        </Popover>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default Role;
