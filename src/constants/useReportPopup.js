import { useState } from "react";

export const useReportPopup = () => {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  return {
    open,
    setOpen,
    summary,
    setSummary,
    data,
    setData,
    loading,
    setLoading,
    page,
    setPage,
    totalRows,
    setTotalRows,
  };
};
