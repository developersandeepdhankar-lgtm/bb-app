import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Popover,
  Form,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  getStates,
  createState,
  deleteState,
} from "../services/locationService";

import IconActionButton from "../components/partial/ActionButtons";
import FormInput from "../components/form/FormInput";

const StateMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      setData(await getStates());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submit = async (values) => {
    try {
      await createState(values);
      message.success("State added");
      form.resetFields();
      setOpen(false);
      fetchData();
    } catch {
      message.error("Failed");
    }
  };

  const columns = [
    { title: "Sr", render: (_, __, i) => i + 1 },
    { title: "State Name", dataIndex: "name" },
    {
      title: "Action",
      render: (_, r) => (
        <Popconfirm
          title="Delete?"
          onConfirm={() => deleteState(r.id).then(fetchData)}
        >
          <IconActionButton type="delete" danger />
        </Popconfirm>
      ),
    },
  ];

  const popover = (
    <div style={{ width: 220 }}>
      <Form form={form} size="small" layout="vertical" onFinish={submit}>
        <FormInput name="name" label="State Name" rules={[{ required: true }]} />
        <Button type="primary" htmlType="submit" size="small">
          Save
        </Button>
      </Form>
    </div>
  );

  return (
    <Card
      title="State Master"
      extra={
        <Popover content={popover} trigger="click" open={open} onOpenChange={setOpen}>
          <Button type="primary" size="small" icon={<PlusOutlined />}>
            Add
          </Button>
        </Popover>
      }
    >
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
    </Card>
  );
};

export default StateMaster;
