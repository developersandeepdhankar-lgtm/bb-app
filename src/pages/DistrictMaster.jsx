import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Popover,
  Form,
  message,
  Select,
  Popconfirm,
  Flex,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  getStates,
  getDistricts,
  createDistrict,
  deleteDistrict,
} from "../services/locationService";

import IconActionButton from "../components/partial/ActionButtons";
import FormInput from "../components/form/FormInput";

const DistrictMaster = () => {
  const [states, setStates] = useState([]);
  const [stateId, setStateId] = useState(null);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    getStates().then(setStates);
    getDistricts().then(setData); // ✅ show all initially
  }, []);

  useEffect(() => {
    if (stateId) getDistricts(stateId).then(setData);
    else getDistricts().then(setData);
  }, [stateId]);

  const submit = async (values) => {
    if (!stateId) {
      message.error("Please select a state first");
      return;
    }
    await createDistrict({ ...values, state_id: stateId });
    message.success("District added");
    setOpen(false);
    form.resetFields();
    getDistricts(stateId).then(setData);
  };

  const columns = [
    { title: "Sr", render: (_, __, i) => i + 1 },
    { title: "District", dataIndex: "name" },
    {
      title: "Action",
      width: 100,
      render: (_, r) => (
        <Popconfirm
          title="Delete this district?"
          onConfirm={() => {
            deleteDistrict(r.id);
            getDistricts(stateId).then(setData);
          }}
        >
          <IconActionButton type="delete" danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="District Master">
      {/* 🔹 HEADER ACTION BAR */}
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: 12 }}
      >
        {/* STATE FILTER */}
        <Select
          allowClear
          showSearch                 // ✅ enable search
          placeholder="All States"
          style={{ width: 280 }}
          options={states.map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          optionFilterProp="label"   // ✅ search by label
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          onChange={(val) => setStateId(val ?? null)}
        />

        {/* ADD DISTRICT */}
        <Popover
          trigger="click"
          open={open}
          onOpenChange={setOpen}
          placement="bottomRight"
          content={
            <Form
              form={form}
              size="small"
              layout="vertical"
              onFinish={submit}
              style={{ width: 220 }}
            >
              <FormInput
                name="name"
                label="District Name"
                rules={[{ required: true }]}
              />

              <Flex justify="end">
                <Button
                  type="primary"
                  size="small"
                  htmlType="submit"
                >
                  Save
                </Button>
              </Flex>
            </Form>
          }
        >
          <Button
            icon={<PlusOutlined />}
            size="small"
            type="primary"
          >
            Add District
          </Button>
        </Popover>
      </Flex>

      {/* TABLE */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default DistrictMaster;
