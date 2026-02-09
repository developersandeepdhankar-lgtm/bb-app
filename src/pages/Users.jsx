import { useEffect, useState } from "react";
import {
  Table,
  Space,
  Card,
  Button,
  message,
  Form,
  Popover,
  Popconfirm,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { getUsers, createUser, deleteUser } from "../services/userService";
import { getRoles } from "../services/roleService";

import IconActionButton from "../components/partial/ActionButtons";
import UserCostCenterDrawer from "../components/UserCostCenterDrawer";

import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";

const Users = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- COST CENTER DRAWER ---------------- */
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ---------------- ADD USER POPOVER ---------------- */
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  /* ---------------- FETCH USERS ---------------- */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      setData(await getUsers());
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    getRoles().then((res) =>
      setRoles(res.map((r) => ({ value: r.id, label: r.name })))
    );
  }, []);

  /* ---------------- CREATE USER ---------------- */
  const submit = async (values) => {
    try {
      setSaving(true);
      await createUser(values);
      message.success("User created");
      form.resetFields();
      setPopoverOpen(false);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.detail || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DELETE USER ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success("User deleted");
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.detail || "Delete failed");
    }
  };

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    { title: "Sr. No", render: (_, __, i) => i + 1 },
    { title: "Name", dataIndex: "name" },
    { title: "Mobile", dataIndex: "mobile" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Action",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          {/* MAP COST CENTER */}
          <IconActionButton
            type="map"
            title="Map Cost Center"
            onClick={() => {
              setSelectedUser(record);
              setDrawerOpen(true);
            }}
          />

          {/* DELETE USER */}
          <Popconfirm
            title="Delete this user?"
            onConfirm={() => handleDelete(record.id)}
          >
            <IconActionButton
              type="delete"
              title="Delete User"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ---------------- SMALL FLOATING FORM ---------------- */
  const popoverContent = (
    <div
      style={{
        width: 250,
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
          name="mobile"
          label="Mobile"
          rules={[
            { required: true },
            { pattern: /^[0-9]{10}$/, message: "Invalid mobile" },
          ]}
        />

        <FormInput
          name="name"
          label="Name"
          rules={[{ required: true }]}
        />

        {/* ✅ EMAIL FIELD */}
        <FormInput
          name="email"
          label="Email"
          rules={[
            { type: "email", message: "Invalid email" },
          ]}
        />

        <FormSelect
          name="role_id"
          label="Role"
          options={roles}
          rules={[{ required: true }]}
        />

        <FormInput
          name="password"
          label="Password"
          type="password"
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
      title="Users"
      extra={
        <Popover
          content={popoverContent}
          trigger="click"
          placement="bottomRight"
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
        >
          {/* ANIMATED ADD BUTTON */}
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
      {/* USERS TABLE */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
      />

      {/* COST CENTER DRAWER */}
      <UserCostCenterDrawer
        user={selectedUser}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUser(null);
        }}
      />
    </Card>
  );
};

export default Users;
