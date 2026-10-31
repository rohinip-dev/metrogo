import { useState, useEffect } from "react";
import axios from "axios";

const SEVERITY_STYLES = {
  info: { bg: "#F0F0FB", border: "#9B8AC4", text: "#5B4D8A", icon: "ℹ️" },
  warning: { bg: "#FBF3DC", border: "#D9B65C", text: "#8A6D1F", icon: "⚠️" },
  critical: { bg: "#FBEAE5", border: "#E08E52", text: "#B85332", icon: "🚨" },
};

function AlertBanner() {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/alerts/active")
      .then((res) => setAlerts(res.data))
      .catch((err) => console.log("Error loading alerts:", err));
  }, []);

  const visibleAlerts = alerts.filter((a) => !dismissed.includes(a._id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40">
      {visibleAlerts.map((alert) => {
        const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
        return (
          <div
            key={alert._id}
            className="border-b px-6 py-2.5 flex items-center justify-center gap-3"
            style={{ backgroundColor: style.bg, borderColor: style.border }}
          >
            <span>{style.icon}</span>
            <p className="font-['Inter'] text-sm text-center" style={{ color: style.text }}>
              <span className="font-semibold">{alert.line}:</span> {alert.message}
            </p>
            <button
              onClick={() => setDismissed((prev) => [...prev, alert._id])}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity ml-2"
              style={{ color: style.text }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default AlertBanner;