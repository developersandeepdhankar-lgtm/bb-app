import { Form, Select } from "antd";

const FormSelect = ({
  name,
  label,
  rules = [],
  placeholder,
  options = [],
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      style={{ marginBottom: 8 }}     // 🔥 key line
      labelCol={{ style: { paddingBottom: 2 } }}
    >
      <Select
        size="small"
        placeholder={placeholder}
      >
        {options.map((opt) => (
          <Select.Option key={opt.value} value={opt.value}>
            {opt.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default FormSelect;
