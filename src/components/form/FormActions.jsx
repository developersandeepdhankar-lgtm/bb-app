import { Button } from "antd";

/* Save + Delete buttons */
const FormActions = ({ loading, onReset }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 16,
      }}
    >
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        style={{
          background: "#6C50BF",
          borderRadius: 6,
          minWidth: 90,
        }}
      >
        Save
      </Button>

      <Button
        danger
        onClick={onReset}
        style={{ borderRadius: 6 }}
      >
        🗑
      </Button>
    </div>
  );
};

export default FormActions;
