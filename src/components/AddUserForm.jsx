import { useEffect, useState } from "react";
import { Form, message } from "antd";

import FormModal from "./form/FormModal";
import FormInput from "./form/FormInput";
import FormSelect from "./form/FormSelect";
import FormDate from "./form/FormDate";
import FormActions from "./form/FormActions";

import { getRoles } from "../services/roleService";
import { createUser } from "../services/userService";

const AddUserForm = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      getRoles().then((data) =>
        setRoles(data.map((r) => ({ value: r.id, label: r.name })))
      );
    }
  }, [open]);

  const submit = async (values) => {
    try {
      setLoading(true);
      await createUser(values);
      message.success("User created");
      onSuccess?.();
      onClose();
    } catch (e) {
      message.error(e.response?.data?.detail || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={open}
      title="ADD DEALER"
      form={form}
      onClose={onClose}
      onSubmit={submit}
    >
      <FormInput
        name="mobile"
        label="Dealer Mobile"
        placeholder="Dealer Mobile"
        rules={[
          { required: true },
          { pattern: /^[0-9]{10}$/, message: "Invalid mobile" },
        ]}
      />

      <FormInput
        name="name"
        label="Brand"
        placeholder="Brand"
        rules={[{ required: true }]}
      />

      <FormSelect
        name="role_id"
        label="Role"
        placeholder="Select Role"
        rules={[{ required: true }]}
        options={roles}
      />

      <FormDate label="Date" />

      <FormInput
        name="email"
        label="Email"
        placeholder="Email"
      />

      <FormInput
        name="password"
        label="Password"
        type="password"
        rules={[{ required: true }]}
      />

      <FormActions
        loading={loading}
        onReset={() => form.resetFields()}
      />
    </FormModal>
  );
};

export default AddUserForm;
