import axios from "axios";
import { formatISO } from "date-fns";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔑 Attach JWT + Global Params
api.interceptors.request.use(
  (config) => {
    /* =========================
       AUTH TOKEN
    ========================= */
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /* =========================
       GLOBAL DATE RANGE
       (stored by DateRangeContext)
    ========================= */
    const storedRange = sessionStorage.getItem("app_date_range");
    const dateRange = storedRange ? JSON.parse(storedRange) : null;

    const from_date = dateRange?.startDate
      ? formatISO(new Date(dateRange.startDate), { representation: "date" })
      : null;

    const to_date = dateRange?.endDate
      ? formatISO(new Date(dateRange.endDate), { representation: "date" })
      : null;

    /* =========================
       VIEW MODE (V / Q)
    ========================= */
    const view = sessionStorage.getItem("viewMode") || "V";

    const globalParams = {
      from_date,
      to_date,
      view, // V or Q
    };

    /* =========================
       ATTACH TO REQUEST
    ========================= */

    // For GET → query params
    if (config.method === "get") {
      config.params = {
        ...config.params,
        ...globalParams,
      };
    }

    // For POST / PUT / PATCH → request body
    if (["post", "put", "patch"].includes(config.method)) {
      config.data = {
        ...config.data,
        ...globalParams,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
