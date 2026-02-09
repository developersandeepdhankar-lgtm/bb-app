import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  InputNumber,
  Select,
  Space,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  getUsers,
} from "../services/userService";

import {
  getStates,
} from "../services/locationService";

import {
  getUserStateTargets,
  upsertUserStateTarget,
} from "../services/userStateTargetService";

const UserStateTargetTable = () => {
  const [users, setUsers] = useState([]);
  const [states, setStates] = useState([]);
  const [targets, setTargets] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------- LOAD MASTER DATA ---------- */
  useEffect(() => {
    getUsers().then(setUsers);
    getStates().then(setStates);
  }, []);

  /* ---------- LOAD USER TARGETS ---------- */
  useEffect(() => {
    if (!selectedUser) return;

    setLoading(true);
    getUserStateTargets(selectedUser)
      .then(setTargets)
      .finally(() => setLoading(false));
  }, [selectedUser]);

  /* ---------- UPDATE TARGET ---------- */
  const updateTarget = async (stateId, value) => {
    try {
      await upsertUserStateTarget({
        user_id: selectedUser,
        state_id: stateId,
        target_value: value || 0,
      });

      message.success("Target saved");

      const updated = targets.map((t) =>
        t.state_id === stateId
          ? { ...t, target_value: value }
          : t
      );
      setTargets(updated);
    } catch {
      message.error("Failed to save target");
    }
  };

  /* ---------- ADD ALL STATES ---------- */
  const addAllStates = () => {
    const rows = states.map((s) => ({
      state_id: s.id,
      state_name: s.name,
      target_value: 0,
    }));
    setTargets(rows);
  };

  /* ---------- TOTAL ---------- */
  const totalTarget = targets.reduce(
    (sum, r) => sum + Number(r.target_value || 0),
    0
  );

  const columns = [
    {
      title: "State",
      dataIndex: "state_name",
    },
    {
      title: "Target",
      render: (_, r) => (
        <InputNumber
          min={0}
          style={{ width: 150 }}
          value={r.target_value}
          onChange={(v) => updateTarget(r.state_id, v)}
        />
      ),
    },
  ];

  return (
    <Card
      title="User × State Targets"
      style={{ margin: 20 }}
      extra={
        <Space>
          {/* USER SELECT */}
          <Select
            placeholder="Select User"
            style={{ width: 220 }}
            options={users.map((u) => ({
              value: u.id,
              label: u.name,
            }))}
            onChange={setSelectedUser}
          />

          {/* 🔥 GUARANTEED ADD BUTTON */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addAllStates}
          >
            Add States
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="state_id"
        columns={columns}
        dataSource={targets}
        loading={loading}
        pagination={false}
        footer={() => (
          <b>Total Target: ₹ {totalTarget.toLocaleString()}</b>
        )}
      />
    </Card>
  );
};

export default UserStateTargetTable;
