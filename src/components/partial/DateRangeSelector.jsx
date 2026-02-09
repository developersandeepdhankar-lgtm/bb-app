import React, { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  format,
} from "date-fns";
import { enUS } from "date-fns/locale";

import {
  Box,
  TextField,
  Paper,
  Typography,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/* Presets */
const presets = [
  {
    label: "Current Week",
    range: () => ({
      startDate: startOfWeek(new Date()),
      endDate: endOfWeek(new Date()),
    }),
  },
  {
    label: "Last Week",
    range: () => ({
      startDate: startOfWeek(subWeeks(new Date(), 1)),
      endDate: endOfWeek(subWeeks(new Date(), 1)),
    }),
  },
  {
    label: "Current Month",
    range: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last Month",
    range: () => ({
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
];

const toDate = (d) => (d instanceof Date ? d : new Date(d));

const DateRangeInputMui = ({ value, onApply }) => {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);

  const normalize = (v) => ({
    startDate: toDate(v.startDate),
    endDate: toDate(v.endDate),
    key: "selection",
  });

  const [tempRange, setTempRange] = useState([normalize(value)]);
  const [finalRange, setFinalRange] = useState([normalize(value)]);

  /* 🔑 SYNC FROM CONTEXT / SESSION */
  useEffect(() => {
    if (value?.startDate && value?.endDate) {
      const normalized = normalize(value);
      setTempRange([normalized]);
      setFinalRange([normalized]);
    }
  }, [value]);

  /* Close on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setTempRange(finalRange);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [finalRange]);

  const applyPreset = (preset) => {
    const r = preset.range();
    setTempRange([{ ...r, key: "selection" }]);
  };

  const apply = () => {
    setFinalRange(tempRange);
    onApply?.(tempRange[0]);
    setOpen(false);
  };

  const cancel = () => {
    setTempRange(finalRange);
    setOpen(false);
  };

  /* SAFE display string */
  const displayValue =
    finalRange[0]?.startDate && finalRange[0]?.endDate
      ? `${format(finalRange[0].startDate, "dd MMM yyyy")} - ${format(
          finalRange[0].endDate,
          "dd MMM yyyy"
        )}`
      : "";

  return (
    <Box ref={wrapperRef} sx={{ position: "relative", width: 320 }}>
      <TextField
        fullWidth
        size="small"
        value={displayValue}
        onClick={() => setOpen(true)}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <CalendarMonthIcon sx={{ mr: 1, color: "primary.main" }} />
          ),
        }}
      />

      {open && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            top: 46,
            zIndex: 20,
            display: "flex",
            borderRadius: 2,
            overflow: "hidden",
            maxWidth: "100vw",
          }}
        >
          {/* Presets */}
          <Box sx={{ width: 160, bgcolor: "#f9fafb" }}>
            <Typography sx={{ p: 1.5, fontWeight: 600 }}>
              Quick Select
            </Typography>
            <Divider />
            {presets.map((p) => (
              <Box
                key={p.label}
                onClick={() => applyPreset(p)}
                sx={{
                  px: 2,
                  py: 1.2,
                  cursor: "pointer",
                  fontSize: 14,
                  "&:hover": { bgcolor: "#e5e7eb" },
                }}
              >
                {p.label}
              </Box>
            ))}
          </Box>

          {/* Calendar + Actions */}
          <Box>
            <DateRange
              ranges={tempRange}
              onChange={(item) =>
                setTempRange([item.selection])
              }
              moveRangeOnFirstSelection={false}
              editableDateInputs
              locale={enUS}
            />

            <Divider />
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              sx={{ p: 1.5 }}
            >
              <Button size="small" onClick={cancel}>
                Cancel
              </Button>
              <Button size="small" variant="contained" onClick={apply}>
                Apply
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default DateRangeInputMui;
