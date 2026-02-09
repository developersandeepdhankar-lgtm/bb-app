import React from "react";
import CountUp from "react-countup";
import { Tooltip } from "antd";
import {
  formatIndianCurrency,
  formatExactIndianCurrency,
} from "../../utils/numberFormat";

const DashboardTile = React.memo(({ item, onClick }) => {
  return (
    <div className="col-xl-2 col-lg-6 col-md-6 col-sm-6">
      <div
        className={`card dashboard-card ${item.bg} border-0 rounded-4`}
        style={{ cursor: item.popup ? "pointer" : "default" }}
        onClick={() => item.popup && onClick(item)}
      >
        <div className="card-body p-2 text-black">
          <p className="fs-12 text-uppercase">{item.title}</p>

          <Tooltip title={formatExactIndianCurrency(item.value)}>
            <h3>
              <CountUp
                start={item.value}
                end={item.value}
                duration={0}
                preserveValue
                formattingFn={(val) =>
                  formatIndianCurrency(val, true)
                }
              />
            </h3>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

export default DashboardTile;
