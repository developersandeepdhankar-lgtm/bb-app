import { Modal, Form } from "antd";

/* =====================================================
   GENERIC FORM MODAL (SCREENSHOT STYLE)
===================================================== */
const FormModal = ({
  open,
  title,
  width = 420,
  onClose,
  onSubmit,
  form,
  children,
}) => {
  return (
    <Modal
      open={open}
      title={<span style={{ fontWeight: 600 }}>{title}</span>}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={width}
      bodyStyle={{ paddingTop: 8 }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onSubmit}
      >
        {children}
      </Form>
    </Modal>
  );
};

export default FormModal;
