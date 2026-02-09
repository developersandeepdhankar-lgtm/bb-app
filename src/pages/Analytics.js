import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Tooltip } from "antd";

import ReportPopup from "../components/partial/ReportPopup";
import {
  receivablesColumns,
  customersColumns,
} from "../constants/tableColumns";

import { getDashboardSummary } from "../services/dashboardService";
import { getDashboardDetails } from "../services/dashboardDetailsService";
import { getStates, getDistrictsByState } from "../services/locationService";

import {
  formatIndianCurrency,
  formatExactIndianCurrency,
} from "../utils/numberFormat";

import TallyVoucherView from "../components/voucher/TallyVoucherView";
import { getVoucherDetail } from "../services/voucherService";
import StockPopup from "../components/stock/StockPopup";

import IndiaSalesView from "../components/dashboard/IndiaSalesView";

/* ======================================================
   TILE → BACKEND TYPE
====================================================== */
const DETAIL_KEY_MAP = {
  today_sales: "sales",
  current_month_sales: "sales",
  year_sales: "sales",
  selected_period_sales: "sales",
  quotation: "quotation",

  debtors: "debtors",
  creditors: "creditors",

  customer: "customers",
};

/* ======================================================
   DATE RANGE HELPER
====================================================== */
const getDateRangeFromTile = (key) => {
  const today = new Date();
  const format = (d) => d.toISOString().slice(0, 10);

  if (key === "today_sales") {
    return { from_date: format(today), to_date: format(today) };
  }

  if (key === "current_month_sales") {
    return {
      from_date: format(new Date(today.getFullYear(), today.getMonth(), 1)),
      to_date: format(today),
    };
  }

  if (key === "year_sales") {
    return {
      from_date: format(new Date(today.getFullYear(), 0, 1)),
      to_date: format(today),
    };
  }

  return {
    from_date: format(new Date(today.getFullYear(), today.getMonth(), 1)),
    to_date: format(today),
  };
};

/* ======================================================
   SALES TABLE COLUMNS
====================================================== */
const voucherColumns = (openVoucher) => [
  { title: "Date", dataIndex: "voucher_date" },
  {
    title: "Voucher No",
    dataIndex: "voucher_no",
    render: (_, row) => (
      <a href="#!" onClick={() => openVoucher(row.guid)}>
        {row.voucher_no}
      </a>
    ),
  },
  { title: "Party Name", dataIndex: "party_name" },
  {
    title: "Amount",
    dataIndex: "total_amount",
    render: formatExactIndianCurrency,
  },
];

export default function Analytics() {
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [popupTile, setPopupTile] = useState(null);
  const [popupData, setPopupData] = useState([]);
  const [popupSummary, setPopupSummary] = useState({});
  const [popupLoading, setPopupLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const [search, setSearch] = useState("");
  const [aging, setAging] = useState("");
  const [mobile, setMobile] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");

  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);

  const [voucherPopup, setVoucherPopup] = useState(null);
  const [stockPopupOpen, setStockPopupOpen] = useState(false);

  /* =========================
     LOAD DASHBOARD (ONCE)
  ========================= */
  useEffect(() => {
    loadDashboard();
    loadStates();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await getDashboardSummary();
      setTiles(
        (res?.summary || []).map((t) => ({
          ...t,
          popup: t.popup === true || t.popup === "true",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStates = async () => {
    const data = await getStates();
    setStateOptions(
      data.map((s) => ({
        label: s.name,
        value: s.id,
      }))
    );
  };

  /* =========================
     LOAD DISTRICTS (STATE CHANGE)
  ========================= */
  useEffect(() => {
    if (!stateId) {
      setDistrictOptions([]);
      return;
    }
    loadDistricts(stateId);
  }, [stateId]);

  const loadDistricts = async (sid) => {
    const data = await getDistrictsByState(sid);
    setDistrictOptions(
      data.map((d) => ({
        label: d.name,
        value: d.id,
      }))
    );
  };

  /* =========================
     FETCH POPUP DATA
  ========================= */
  const fetchPopupData = async (item, pageNo = 1) => {
    setPopupLoading(true);

    const backendType = DETAIL_KEY_MAP[item.key];
    const isSales =
      backendType === "sales" || backendType === "quotation";

    const params = {
      page: pageNo,
      page_size: 10,
      from_date: item.from_date,
      to_date: item.to_date,
    };

    if (search.trim()) params.search = search.trim();
    if (!isSales && backendType !== "customers" && aging)
      params.aging = aging;

    if (backendType === "customers") {
      if (mobile) params.mobile = mobile;
      if (stateId) params.state_id = stateId;
      if (districtId) params.district_id = districtId;
    }


    if (backendType === "sales") {
      if (item.key === "today_sales") params.load_view = "today";
      else if (item.key === "current_month_sales")
        params.load_view = "current_month";
      else params.load_view = "custom";
    }

    const res = await getDashboardDetails(backendType, params);

    setPopupData(res.rows || []);
    setTotalRows(res.total || 0);
    setPopupSummary(res.summary || {});
    setPopupLoading(false);
  };

  /* =========================
     TILE CLICK
  ========================= */
  const handleTileClick = (item) => {
    setSearch("");
    setMobile("");
    setStateId("");
    setDistrictId("");
    setAging("");

    if (item.key === "inventory") {
      setStockPopupOpen(true);
      return;
    }
    if (!item.popup) return;

    const range = getDateRangeFromTile(item.key);
    const tile = { ...item, ...range };

    setPopupTile(tile);
    setPage(1);

    fetchPopupData(tile, 1);
  };

  /* =========================
     FILTER CHANGE → REFETCH
  ========================= */
  useEffect(() => {
    if (!popupTile) return;

    const backendType = DETAIL_KEY_MAP[popupTile.key];

    if (
      backendType === "customers" ||
      backendType === "debtors" ||
      backendType === "creditors"
    ) {
      setPage(1);
      fetchPopupData(popupTile, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, aging, mobile, stateId, districtId]);

  /* =========================
     OPEN VOUCHER
  ========================= */
  const openVoucher = async (guid) => {
    const data = await getVoucherDetail(guid);
    setVoucherPopup(data);
  };

  return (
    <div className="container-fluid py-4">
      {/* DASHBOARD TILES */}
      <div className="row g-3">
        {!loading &&
          tiles.map((item) => (
            <div key={item.key} className="col-xl-2 col-lg-3 col-md-4">
              <div
                className={`card ${item.bg} rounded-4`}
                style={{ cursor: item.popup ? "pointer" : "default" }}
                onClick={() => handleTileClick(item)}
              >
                <div className="card-body p-2">
                  <p className="fs-12 text-uppercase">{item.title}</p>
                  <Tooltip title={formatExactIndianCurrency(item.value)}>
                    <h3>
                      <CountUp
                        end={item.value}
                        duration={0}
                        formattingFn={(v) =>
                          item.key === "customer"
                            ? v.toString()
                            : formatIndianCurrency(v, true)
                        }
                      />
                    </h3>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="my-4">
        <IndiaSalesView />
      </div>

      {popupTile && (
        <ReportPopup
          open={!!popupTile}
          title={popupTile.title}
          summary={popupSummary}
          summaryConfig={
            DETAIL_KEY_MAP[popupTile.key] === "customers"
              ? []
              : DETAIL_KEY_MAP[popupTile.key] === "sales" ||
                DETAIL_KEY_MAP[popupTile.key] === "quotation"
              ? [
                  { label: "Total Sales", key: "total_sales", format: formatExactIndianCurrency },
                  { label: "Total Vouchers", key: "total_vouchers" },
                ]
              : [
                  { label: "Total Amount", key: "total_amount", format: formatExactIndianCurrency },
                  { label: "Overdue Amount", key: "overdue_amount", format: formatExactIndianCurrency },
                ]
          }
          filters={
            DETAIL_KEY_MAP[popupTile.key] === "customers"
              ? [
                  {
                    type: "search",
                    key: "search",
                    value: search,
                    placeholder: "Search by name / mobile",
                  },
                  {
                    type: "input",
                    key: "mobile",
                    value: mobile,
                    placeholder: "Mobile number",
                  },
                  {
                    type: "select",
                    key: "state",
                    value: stateId || undefined,   // ✅ IMPORTANT
                    placeholder: "Please select state",
                    options: [
                      { label: "Please select state", value: "" }, // ✅ first option
                      ...stateOptions,
                    ],
                    searchable: true,              // ✅ searchable
                  },
                  {
                    type: "select",
                    key: "district",
                    value: districtId || undefined, // ✅ IMPORTANT
                    placeholder: "Please select district",
                    options: [
                      { label: "Please select district", value: "" },
                      ...districtOptions,
                    ],
                    searchable: true,
                    disabled: !stateId,             // ✅ disable until state selected
                  },
                ]
              : [
                  { type: "search", key: "search", value: search },
                  {
                    type: "select",
                    key: "aging",
                    value: aging,
                    options: [
                      { label: "All Aging", value: "" },
                      { label: "0–30", value: "0-30" },
                      { label: "31–60", value: "31-60" },
                      { label: "60+", value: "60+" },
                    ],
                  },
                ]
          }
          columns={
            DETAIL_KEY_MAP[popupTile.key] === "customers"
              ? customersColumns
              : DETAIL_KEY_MAP[popupTile.key] === "sales" ||
                DETAIL_KEY_MAP[popupTile.key] === "quotation"
              ? voucherColumns(openVoucher)
              : receivablesColumns
          }
          data={popupData}
          loading={popupLoading}
          page={page}
          totalRows={totalRows}
          onFilterChange={(k, v) => {
            if (k === "search") setSearch(v);
            if (k === "aging") setAging(v);
            if (k === "mobile") setMobile(v);
            if (k === "state") {
              setStateId(v);
              setDistrictId("");
            }
            if (k === "district") setDistrictId(v);
          }}
          onPageChange={(p) => {
            setPage(p);
            fetchPopupData(popupTile, p);
          }}
          onClose={() => setPopupTile(null)}
        />
      )}

      <StockPopup
        open={stockPopupOpen}
        onClose={() => setStockPopupOpen(false)}
      />

      <TallyVoucherView
        open={!!voucherPopup}
        data={voucherPopup}
        onClose={() => setVoucherPopup(null)}
      />
    </div>
  );
}
