import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FBF6EC]/90 backdrop-blur-md border-b border-[#E4D9C4]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E08E52]"></span>
          <span className="font-['Fraunces'] text-lg font-semibold text-[#3E332A] tracking-tight">
            MetroGo
          </span>
        </Link>
                <div className="flex items-center gap-6 font-['Inter'] text-sm text-[#7A6C5D]">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "transition-colors " + (isActive ? "text-[#E08E52] font-semibold" : "hover:text-[#3E332A]")
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/metro-map"
            className={({ isActive }) =>
              "transition-colors " + (isActive ? "text-[#E08E52] font-semibold" : "hover:text-[#3E332A]")
            }
          >
            Map
          </NavLink>
          <NavLink
            to="/book"
            className={({ isActive }) =>
              "transition-colors " + (isActive ? "text-[#E08E52] font-semibold" : "hover:text-[#3E332A]")
            }
          >
            Book
          </NavLink>
          <NavLink
            to="/lost-found"
            className={({ isActive }) =>
              "transition-colors " + (isActive ? "text-[#E08E52] font-semibold" : "hover:text-[#3E332A]")
            }
          >
            Lost & Found
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  "transition-colors " + (isActive ? "text-[#E08E52] font-semibold" : "hover:text-[#3E332A]")
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/my-bookings"
                className={({ isActive }) =>
                  "transition-colors " + (isActive ? "text-[#E08E52] font-semibold" : "hover:text-[#3E332A]")
                }
              >
                My Tickets
              </NavLink>
              <NavLink
                to="/wallet"
                className={({ isActive }) =>
                  "transition-colors " + (isActive ? "text-[#E08E52] font-semibold" : "hover:text-[#3E332A]")
                }
              >
                Wallet
              </NavLink>
              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    "transition-colors " + (isActive ? "text-[#E08E52] font-semibold" : "hover:text-[#3E332A]")
                  }
                >
                  Admin
                </NavLink>
              )}
              <span className="text-[#9B8AC4] font-medium">Hi, {user.name.split(" ")[0]}</span>
                            <NotificationBell />
              <button onClick={handleLogout} className="hover:text-[#3E332A] transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-[#3E332A] transition-colors">Login</Link>
              <Link to="/signup" className="px-4 py-2 bg-[#E08E52] text-white rounded-full shadow-[0_4px_14px_rgba(224,142,82,0.35)] hover:shadow-[0_6px_20px_rgba(224,142,82,0.45)] transition-shadow">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;