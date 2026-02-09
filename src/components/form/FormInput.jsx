import { Form, Input } from "antd";

const FormInput = ({
  name,
  label,
  rules = [],
  placeholder,
  type = "text",
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      style={{ marginBottom: 8 }}     // 🔥 key line
      labelCol={{ style: { paddingBottom: 2 } }} // 🔽 label gap
    >
      {type === "password" ? (
        <Input.Password
          size="small"
          placeholder={placeholder}
          style={{ height: 28 }}      // 🔽 compact height
        />
      ) : (
        <Input
          size="small"
          placeholder={placeholder}
          style={{ height: 28 }}
        />
      )}
    </Form.Item>
  );
};

export default FormInput;
