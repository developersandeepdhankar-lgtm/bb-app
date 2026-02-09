import api from "./api";

/**
 * Get all incentive rules
 */
export const getIncentiveRules = async () => {
  const res = await api.get("/incentive-rules");
  return res.data;
};

/**
 * Create incentive rule
 */
export const createIncentiveRule = async (payload) => {
  const res = await api.post("/incentive-rules", payload);
  return res.data;
};

/**
 * Update incentive rule
 */
export const updateIncentiveRule = async (id, payload) => {
  const res = await api.put(`/incentive-rules/${id}`, payload);
  return res.data;
};

/**
 * Delete incentive rule
 */
export const deleteIncentiveRule = async (id) => {
  const res = await api.delete(`/incentive-rules/${id}`);
  return res.data;
};
