import api from "./api";

export const getQuotationDetail = async (guid) => {
  const res = await api.get(`/quotations/${guid}`);
  return res.data;
};
