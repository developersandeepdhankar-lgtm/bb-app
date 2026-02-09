import api from "./api";

export const getVoucherDetail = async (guid) => {
  const res = await api.get(`/vouchers/${guid}`);
  return res.data;
};
