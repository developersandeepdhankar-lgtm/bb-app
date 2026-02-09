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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  getStates,
  getDistricts,
  getPincodes,
  createPincode,
  deletePincode,
} from "../services/locationService";

import IconActionButton from "../components/partial/ActionButtons";
import FormInput from "../components/form/FormInput";

const PincodeMaster = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [stateId, setStateId] = useState();
  const [districtId, setDistrictId] = useState();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    getStates().then(setStates);
  }, []);

  useEffect(() => {
    if (stateId) getDistricts(stateId).then(setDistricts);
  }, [stateId]);

  useEffect(() => {
    if (districtId) getPincodes(districtId).then(setData);
  }, [districtId]);

  const submit = async (values) => {
    await createPincode({ ...values, district_id: districtId });
    message.success("Pincode added");
    setOpen(false);
    form.resetFields();
    getPincodes(districtId).then(setData);
  };

  const columns = [
    { title: "PIN", dataIndex: "pincode" },
    { title: "Office", dataIndex: "office_name" },
    {
      title: "Action",
      render: (_, r) => (
        <Popconfirm title="Delete?" onConfirm={() => deletePincode(r.id)}>
          <IconActionButton type="delete" danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="Pincode Master">
      <Select
        placeholder="State"
        style={{ width: 200, marginRight: 8 }}
        options={states.map((s) => ({ value: s.id, label: s.name }))}
        onChange={setStateId}
      />

      <Select
        placeholder="District"
        style={{ width: 200 }}
        options={districts.map((d) => ({ value: d.id, label: d.name }))}
        onChange={setDistrictId}
      />

      <Popover
        content={
          <Form size="small" layout="vertical" onFinish={submit}>
            <FormInput name="pincode" label="Pincode" rules={[{ required: true }]} />
            <FormInput name="office_name" label="Office Name" />
            <Button size="small" type="primary" htmlType="submit">
              Save
            </Button>
          </Form>
        }
        trigger="click"
        open={open}
        onOpenChange={setOpen}
      >
        <Button size="small" type="primary" icon={<PlusOutlined />}>
          Add Pincode
        </Button>
      </Popover>

      <Table rowKey="id" columns={columns} dataSource={data} />
    </Card>
  );
};

export default PincodeMaster;
