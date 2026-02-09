import api from "./api";

export const getDashboardDetails = async (type, params = {}) => {
  const res = await api.get(`/dashboard/details/${type}`, { params });

  return {
    rows: res.data?.rows || [],          // ✅ FIX HERE
    total: res.data?.total || 0,
    summary: res.data?.summary || {
      total_amount: 0,
      overdue_amount: 0,
    },
  };
};
