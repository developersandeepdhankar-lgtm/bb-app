import api from "./api";

export const getStockGroupTree = () =>
  api.get("/stock-groups/tree").then(res => res.data);

export const getStockAgeing = () =>
  api.get("/stock-ageing").then(res => res.data);

export const getLowStockAlerts = () =>
  api.get("/stock-alerts/low-stock").then(res => res.data); 



export const getItemSalesHistory = (itemGuid) =>
  api.get(`/item-sales/${itemGuid}`).then(res => res.data);

export const getStockItems = () =>
  api.get("/stock-items").then(res => res.data);

export const getItemGPTrend = (itemGuid) =>
  api.get(`/item-gp/${itemGuid}`).then(res => res.data);