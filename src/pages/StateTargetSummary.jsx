import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Select,
  InputNumber,
  message,
} from "antd";

import { getUsers } from "../services/userService";
import { getStates } from "../services/locationService";
import {
  getUserStateTargets,
  saveUserStateTarget,
} from "../services/userStateTargetService";

const UserStateTargets = () => {
  const [users, setUsers] = useState([]);
  const [states, setStates] = useState([]);
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [savingKey, setSavingKey] = useState(null);

  /* ---------------- LOAD USERS & STATES ---------------- */
  useEffect(() => {
    getUsers().then(setUsers);
    getStates().then(setStates);
  }, []);

  /* ---------------- LOAD TARGETS ---------------- */
  const fetchTargets = async (uid) => {
    if (!uid) return;

    const targets = await getUserStateTargets(uid);

    const merged = states.map((s) => {
      const found = targets.find((t) => t.state_id === s.id);
      return {
        state_id: s.id,
        state_name: s.name,
        target_value: found ? Number(found.target_value) : 0,
      };
    });

    setData(merged);
  };

  /* ---------------- SAVE TARGET ---------------- */
  const saveTarget = async (record) => {
    try {
      setSavingKey(record.state_id);

      await saveUserStateTarget({
        user_id: userId,
        state_id: record.state_id,
        target_value: Number(record.target_value || 0),
      });

      message.success("Target saved");
    } catch {
      message.error("Failed to save target");
    } finally {
      setSavingKey(null);
    }
  };

  /* ---------------- TOTAL ---------------- */
  const totalTarget = data.reduce(
    (sum, r) => sum + Number(r.target_value || 0),
    0
  );

  /* ---------------- TABLE ---------------- */
  const columns = [
    {
      title: "Sr. No",
      width: 80,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "State",
      dataIndex: "state_name",
    },
    {
      title: "Target",
      width: 220,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.target_value}
          style={{ width: "100%" }}
          formatter={(v) => `₹ ${v}`}
          parser={(v) => v.replace(/[₹,\s]/g, "")}
          onChange={(val) => {
            setData((prev) =>
              prev.map((r) =>
                r.state_id === record.state_id
                  ? { ...r, target_value: val }
                  : r
              )
            );
          }}
          onBlur={() => saveTarget(record)}
          onPressEnter={() => saveTarget(record)}
          disabled={savingKey === record.state_id}
        />
      ),
    },
  ];

  return (
    <Card
      title="User × State Targets"
      extra={
        <Select
          placeholder="Select User"
          style={{ width: 260 }}
          options={users.map((u) => ({
            value: u.id,
            label: u.name,
          }))}
          onChange={(uid) => {
            setUserId(uid);
            fetchTargets(uid);
          }}
        />
      }
    >
      <Table
        rowKey="state_id"
        columns={columns}
        dataSource={data}
        pagination={false}
        footer={() => (
          <b>Total Target: ₹ {totalTarget.toLocaleString()}</b>
        )}
      />
    </Card>
  );
};

export default UserStateTargets;
