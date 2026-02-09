import api from "./api";

/* ======================
   STATES
====================== */
export const getStates = async () => {
  const res = await api.get("/states");
  return res.data;
};

export const createState = async (data) => {
  const res = await api.post("/states", data);
  return res.data;
};

export const deleteState = async (id) => {
  await api.delete(`/states/${id}`);
};


export const getIndiaSalesMap = async () => {
  const res = await api.get("/states/map");
  return res.data;
};
/* ======================
   DISTRICTS
====================== */
export const getDistricts = async (stateId = null) => {
  let url = "/districts";

  if (stateId !== null && stateId !== undefined) {
    url += `?state_id=${stateId}`;
  }

  const res = await api.get(url);
  return res.data;
};

export const createDistrict = async (data) => {
  const res = await api.post("/districts", data);
  return res.data;
};

export const deleteDistrict = async (id) => {
  await api.delete(`/districts/${id}`);
};

/* ======================
   PINCODES
====================== */
export const getPincodes = async (districtId = null) => {
  let url = "/pincodes";

  if (districtId !== null && districtId !== undefined) {
    url += `?district_id=${districtId}`;
  }

  const res = await api.get(url);
  return res.data;
};

export const createPincode = async (data) => {
  const res = await api.post("/pincodes", data);
  return res.data;
};

export const deletePincode = async (id) => {
  await api.delete(`/pincodes/${id}`);
};



export const getDistrictsByState = async (stateId) => {
  if (!stateId) return [];
  const res = await api.get(`/districts`, {
    params: { state_id: stateId },
  });
  return res.data || [];
};
