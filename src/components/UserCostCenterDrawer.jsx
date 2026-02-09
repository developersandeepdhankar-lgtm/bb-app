import { useEffect, useState } from "react";
import {
  Drawer,
  Select,
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Spin,
} from "antd";

import {
  getAvailableCostCenters,
  getUserCostCenters,
  mapCostCenterToUser,
  removeCostCenterMap,
} from "../services/costCenterUserMap";

const UserCostCenterDrawer = ({ user, open, onClose }) => {
  /* ---------------- STATE ---------------- */
  const [available, setAvailable] = useState([]);
  const [mapped, setMapped] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!open || !user) return;

    const load = async () => {
      try {
        setLoading(true);

        const [avail, userMaps] = await Promise.all([
          getAvailableCostCenters(),
          getUserCostCenters(user.id),
        ]);

        setAvailable(avail || []);
        setMapped(userMaps || []);
      } catch (err) {
        message.error("Failed to load cost centers");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, user]);

  /* ---------------- MAP COST CENTER ---------------- */
  const handleMap = async () => {
    if (!selected) return;

    try {
      setSaving(true);

      await mapCostCenterToUser({
        user_id: user.id,
        cost_centre: selected,
      });

      message.success("Cost center mapped");

      setSelected(null);

      // reload lists
      const [avail, userMaps] = await Promise.all([
        getAvailableCostCenters(),
        getUserCostCenters(user.id),
      ]);

      setAvailable(avail);
      setMapped(userMaps);
    } catch (err) {
      message.error(
        err.response?.data?.detail || "Mapping failed"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- REMOVE MAP ---------------- */
  const handleRemove = async (id) => {
    try {
      await removeCostCenterMap(id);
      message.success("Removed");

      const userMaps = await getUserCostCenters(user.id);
      setMapped(userMaps);
    } catch {
      message.error("Remove failed");
    }
  };

  /* ---------------- TABLE ---------------- */
  const columns = [
    {
      title: "Sr. No",
      width: 80,
      render: (_, __, i) => i + 1,
    },
    {
      title: "Cost Center",
      dataIndex: "cost_centre",
    },
    {
      title: "Action",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Remove this cost center?"
          onConfirm={() => handleRemove(record.id)}
        >
          <Button size="small" danger>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  /* ---------------- RENDER ---------------- */
  return (
    <Drawer
      title={`Cost Centers → ${user?.name || ""}`}
      open={open}
      onClose={onClose}
      width="50vw"                
      destroyOnClose
      bodyStyle={{ padding: 16 }}
      zIndex={2000}
    >
      {loading ? (
        <Spin />
      ) : (
        <>
          {/* -------- ADD COST CENTER -------- */}
          <Space style={{ marginBottom: 12 }}>
            <Select
              style={{ width: 260 }}
              placeholder="Select cost center"
              options={available.map((c) => ({
                value: c,
                label: c,
              }))}
              value={selected}
              onChange={setSelected}
              allowClear
              showSearch
            />

            <Button
              type="primary"
              loading={saving}
              onClick={handleMap}
              disabled={!selected}
            >
              Map
            </Button>
          </Space>

          {/* -------- MAPPED LIST -------- */}
          <Table
            rowKey="id"
            columns={columns}
            dataSource={mapped}
            pagination={false}
            size="small"
          />
        </>
      )}
    </Drawer>
  );
};

export default UserCostCenterDrawer;
