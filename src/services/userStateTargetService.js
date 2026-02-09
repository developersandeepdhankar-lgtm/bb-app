import api from "./api";

export const getUserStateTargets = async (userId) => {
  const res = await api.get(`/user-state-targets/${userId}`);
  return res.data;
};

export const saveUserStateTarget = async (data) => {
  const res = await api.post("/user-state-targets", data);
  return res.data;
};
export const getStateTotals = async () => {
  const res = await api.get("/user-state-targets/state-totals");
  return res.data;
};
