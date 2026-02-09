import { useEffect, useState } from "react";
import { getIndiaSalesMap } from "../../services/locationService";
import "./IndiaMap.css";

/* ================================
   GRADIENT LOGIC
================================ */
const getGradient = (target, achieved) => {
  if (!target || target <= 0) return "url(#g5)";

  const percent = (achieved / target) * 100;

  if (percent >= 100) return "url(#g1)";
  if (percent >= 75) return "url(#g2)";
  if (percent >= 50) return "url(#g3)";
  if (percent >= 25) return "url(#g4)";
  if (percent > 0) return "url(#g6)";
  return "url(#g5)";
};

const MAP_WIDTH = 650;
const MAP_HEIGHT = 580;

const IndiaMap = () => {
  const [states, setStates] = useState([]);
  const [hoverState, setHoverState] = useState(null);

  useEffect(() => {
    getIndiaSalesMap().then((res) => {
      setStates(res.states || []);
    });
  }, []);

  return (
    <div className="india-map-wrapper">
      {/* ================= SVG MAP ================= */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="india-map-svg"
      >
        {/* ===== GRADIENT DEFINITIONS ===== */}
        <defs>
          <linearGradient id="g1">
            <stop offset="0%" stopColor="#1b8f2f" />
            <stop offset="100%" stopColor="#4fd65a" />
          </linearGradient>

          <linearGradient id="g2">
            <stop offset="0%" stopColor="#59b85c" />
            <stop offset="100%" stopColor="#8fe99a" />
          </linearGradient>

          <linearGradient id="g3">
            <stop offset="0%" stopColor="#9bdc9b" />
            <stop offset="100%" stopColor="#c9f1c9" />
          </linearGradient>

          <linearGradient id="g4">
            <stop offset="0%" stopColor="#cfe9cf" />
            <stop offset="100%" stopColor="#e9f8e9" />
          </linearGradient>

          <linearGradient id="g5">
            <stop offset="0%" stopColor="#d1d1d1" />
            <stop offset="100%" stopColor="#f0f0f0" />
          </linearGradient>

          <linearGradient id="g6">
            <stop offset="0%" stopColor="#f5a5a5" />
            <stop offset="100%" stopColor="#ffd3d3" />
          </linearGradient>
        </defs>

        {/* ===== STATES ===== */}
        {states.map((state) => {
          const fill = getGradient(state.target, state.completed_sales);
          const percent = state.target
            ? Math.round((state.completed_sales / state.target) * 100)
            : 0;

          return (
            <g
              key={state.id}
              onMouseEnter={() => setHoverState(state)}
              onMouseLeave={() => setHoverState(null)}
            >
              <path
                d={state.svg_path}
                fill={fill}
                stroke="#ffffff"
                strokeWidth="1.2"
                className="map-path"
              />

              {state.label_x && state.label_y && (
                <text
                  x={state.label_x}
                  y={state.label_y}
                  textAnchor="middle"
                  className="map-label"
                >
                  {percent}%
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* ================= TOOLTIP ================= */}
      {hoverState && hoverState.label_x && hoverState.label_y && (
        <div
          className={`map-tooltip ${
            hoverState.label_x > MAP_WIDTH * 0.65
              ? "arrow-right"
              : "arrow-left"
          }`}
          style={{
            left: `${(hoverState.label_x / MAP_WIDTH) * 100}%`,
            top: `${(hoverState.label_y / MAP_HEIGHT) * 100}%`,
            transform:
              hoverState.label_x > MAP_WIDTH * 0.65
                ? "translate(-115%, -50%)"
                : "translate(18px, -50%)",
          }}
        >
          <div className="tooltip-title">{hoverState.name}</div>

          <div className="tooltip-row">
            🎯 Target
            <span>
              ₹{Number(hoverState.target || 0).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="tooltip-row">
            ✅ Achieved
            <span>
              ₹
              {Number(hoverState.completed_sales || 0).toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <div className="tooltip-percent">
            📊{" "}
            {hoverState.target
              ? Math.round(
                  (hoverState.completed_sales / hoverState.target) * 100
                )
              : 0}
            %
          </div>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
