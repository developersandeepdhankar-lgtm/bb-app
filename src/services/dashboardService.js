import api from "./api";

/**
 * Dashboard Summary
 * Date range + view mode are auto-attached globally
 */
export const getDashboardSummary = async () => {
  const res = await api.get("/dashboard/summary");
  return res.data;
};
