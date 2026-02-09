/**
 * Indian number formatter with ₹, K, L, Cr
 * ✔ Supports negative values
 * ✔ Tally-style display: -₹46.89 L
 */
export const formatIndianCurrency = (value, withSymbol = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return withSymbol ? "₹0" : "0";
  }

  const num = Number(value);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const symbol = withSymbol ? "₹" : "";

  let formatted = "";

  if (absNum >= 10000000) {
    formatted = `${(absNum / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  } else if (absNum >= 100000) {
    formatted = `${(absNum / 100000).toFixed(2).replace(/\.00$/, "")} L`;
  } else if (absNum >= 1000) {
    formatted = `${(absNum / 1000).toFixed(2).replace(/\.00$/, "")} K`;
  } else {
    formatted = absNum.toString();
  }

  return `${isNegative ? "-" : ""}${symbol}${formatted}`;
};


/**
 * Exact Indian currency formatter (tooltip / detail view)
 * ✔ Supports negative values
 * ✔ Output: -₹4,688,992.79
 */
export const formatExactIndianCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "₹0";
  }

  const num = Number(value);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  return `${isNegative ? "-" : ""}₹${absNum.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
