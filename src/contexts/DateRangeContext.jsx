import React, { createContext, useContext, useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";

const DateRangeContext = createContext(null);

// Default = Current Month
const getDefaultRange = () => ({
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
});

export const DateRangeProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState(() => {
    const saved = sessionStorage.getItem("app_date_range");
    return saved ? JSON.parse(saved) : getDefaultRange();
  });

  // Save to session on change
  useEffect(() => {
    sessionStorage.setItem("app_date_range", JSON.stringify(dateRange));
  }, [dateRange]);

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
};

// Custom hook (clean usage)
export const useDateRange = () => {
  const ctx = useContext(DateRangeContext);
  if (!ctx) {
    throw new Error("useDateRange must be used inside DateRangeProvider");
  }
  return ctx;
};
