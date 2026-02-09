import api from "./api";

/* GET USERS */
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

/* CREATE USER */
export const createUser = async (payload) => {
  const res = await api.post("/users/", payload);
  return res.data;
};

/* DELETE USER */
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};
