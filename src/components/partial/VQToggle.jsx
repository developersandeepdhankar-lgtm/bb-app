import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";

const SELECTED_COLOR = "#6C50BF";

const VQToggle = ({ value = "V", onChange }) => {
  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      onChange?.(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{
        background: "#f3f4f6",
        borderRadius: "20px",
        p: "2px",
        "& .MuiToggleButton-root": {
          border: "none",
          px: 2,
          fontWeight: 600,
          color: "#374151",
        },
        "& .MuiToggleButton-root.Mui-selected": {
          backgroundColor: SELECTED_COLOR,
          color: "#fff",
          "&:hover": {
            backgroundColor: SELECTED_COLOR,
          },
        },
      }}
    >
      <Tooltip title="Value View" arrow placement="top">
        <ToggleButton value="V">V</ToggleButton>
      </Tooltip>

      <Tooltip title="Quantity View" arrow placement="top">
        <ToggleButton value="Q">Q</ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

export default VQToggle;
