import api from "./api";

/* GET ROLES */
export const getRoles = async () => {
  const res = await api.get("/roles");
  return res.data;
};

/* CREATE ROLE */
export const createRole = async (payload) => {
  const res = await api.post("/roles/", payload);
  return res.data;
};

/* DELETE ROLE */
export const deleteRole = async (id) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
};
