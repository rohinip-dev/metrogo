import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const TYPE_ICONS = {
  booking: "🎫",
  wallet: "👛",
  alert: "⚠️",
  emergency: "🚨",
  general: "🔔",
};

function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("metroToken");

  const loadNotifications = () => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      })
      .catch((err) => console.log("Error loading notifications:", err));
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    // Check for new notifications every 30 seconds automatically
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleToggle = async () => {
    const opening = !isOpen;
    setIsOpen(opening);

    if (opening && unreadCount > 0) {
      try {
        await axios.put(
          "http://localhost:5000/api/notifications/mark-read",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnreadCount(0);
      } catch (err) {
        console.log("Error marking as read:", err);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative text-[#7A6C5D] hover:text-[#3E332A] transition-colors"
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E08E52] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          <div className="absolute right-0 top-8 z-50 w-80 max-h-96 overflow-y-auto bg-white border border-[#E4D9C4] rounded-2xl shadow-[0_8px_30px_rgba(155,138,196,0.2)]">
            <div className="px-4 py-3 border-b border-[#E4D9C4]">
              <p className="font-['Fraunces'] font-semibold text-sm text-[#3E332A]">Notifications</p>
            </div>

            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-[#A89985] font-['Inter'] text-center">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className="px-4 py-3 border-b border-[#F0E9DA] last:border-0 flex gap-3"
                >
                  <span className="text-lg shrink-0">{TYPE_ICONS[n.type] || "🔔"}</span>
                  <div>
                    <p className="font-['Inter'] text-sm font-medium text-[#3E332A]">{n.title}</p>
                    <p className="font-['Inter'] text-xs text-[#7A6C5D] mt-0.5">{n.message}</p>
                    <p className="font-['JetBrains_Mono'] text-[9px] text-[#A89985] mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;