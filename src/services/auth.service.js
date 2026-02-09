import api from "./api";

export const loginService = (payload) => {
  return api.post("/auth/login", payload);
};
