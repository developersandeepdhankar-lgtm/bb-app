import { formatIndianCurrency } from "../utils/numberFormat";

export const receivablesColumns = [
  {
    title: "Party Name",
    dataIndex: "party_name",
    key: "party_name",
    fixed: "left",
    width: 260,
  },
  {
    title: "Outstanding",
    dataIndex: "party_total",
    align: "right",
    render: (v) => formatIndianCurrency(v),
  },
  {
    title: "Bill Date",
    dataIndex: "bill_date",
  },
  {
    title: "Due Date",
    dataIndex: "due_date",
  },
  {
    title: "Overdue Amount",
    dataIndex: "overdue_amount",
    align: "right",
    render: (v) =>
      v > 0 ? (
        <span className="text-danger fw-semibold">
          {formatIndianCurrency(v)}
        </span>
      ) : "-",
  },
  {
    title: "Overdue Days",
    dataIndex: "overdue_days",
    align: "center",
    render: (v) =>
      v > 0 ? <span className="text-danger fw-semibold">{v}</span> : "-",
  },
];

export const salesVoucherColumns = [
  {
    title: "Voucher No",
    dataIndex: "voucher_no",
  },
  {
    title: "Date",
    dataIndex: "voucher_date",
  },
  {
    title: "Party",
    dataIndex: "party_name",
  },
  {
    title: "Type",
    dataIndex: "voucher_type",
  },
  {
    title: "Amount (₹)",
    dataIndex: "amount_with_gst",
    align: "right",
    render: (v) => formatIndianCurrency(v, true),
  },
];

export const customersColumns = [
  { title: "Name", dataIndex: "name" },
  { title: "Mobile", dataIndex: "mobile" },
  { title: "State", dataIndex: "state" },
  { title: "District", dataIndex: "district" },
  { title: "Pincode", dataIndex: "pincode" },
];
