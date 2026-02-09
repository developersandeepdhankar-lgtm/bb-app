import api from "./api";

export const getAvailableCostCenters = async () => {
  const res = await api.get(
    "/cost-center-user-maps/available"
  );
  return res.data;
};

export const getUserCostCenters = async (userId) => {
  const res = await api.get(
    `/cost-center-user-maps/user/${userId}`
  );
  return res.data;
};

export const mapCostCenterToUser = async (payload) => {
  const res = await api.post(
    "/cost-center-user-maps",
    payload
  );
  return res.data;
};

export const removeCostCenterMap = async (mapId) => {
  const res = await api.delete(
    `/cost-center-user-maps/${mapId}`
  );
  return res.data;
};
