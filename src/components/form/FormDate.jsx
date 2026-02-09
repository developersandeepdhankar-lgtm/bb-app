import { Form, DatePicker } from "antd";

const FormDate = ({ label }) => {
  return (
    <Form.Item label={label}>
      <DatePicker style={{ width: "100%" }} />
    </Form.Item>
  );
};

export default FormDate;
