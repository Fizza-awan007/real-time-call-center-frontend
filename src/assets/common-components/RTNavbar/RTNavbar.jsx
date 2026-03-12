import { useState } from "react";
import { NavLink } from "react-router-dom";
import Avatar from "../../RTIcons/Avatar";
import LogoIcon from "../../RTIcons/Logo";

const RTNavbar = ({
  userName,
  userRole = "Admin",
  avatarSrc = null
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStoredUserName = () => {
    try {
      const directName = localStorage.getItem("user_name");
      if (directName && directName.trim()) {
        return directName.trim();
      }

      const userRaw = localStorage.getItem("user");
      if (!userRaw) {
        return null;
      }

      const parsedUser = JSON.parse(userRaw);
      const parsedName =
        parsedUser?.name ||
        parsedUser?.full_name ||
        parsedUser?.fullName ||
        parsedUser?.username;

      return typeof parsedName === "string" && parsedName.trim()
        ? parsedName.trim()
        : null;
    } catch {
      return null;
    }
  };

  const resolvedUserName = userName?.trim() || getStoredUserName() || "Chris Miguel";

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="flex h-[60px] items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center">
            <LogoIcon className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-1">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-lg text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-[#62748E] hover:text-[#1a1d23] hover:bg-gray-100"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-lg text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-[#62748E] hover:text-[#1a1d23] hover:bg-gray-100"
              }`
            }
          >
            Upload File
          </NavLink>
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
            {avatarSrc
              ? <img
                  src={avatarSrc}
                  alt={resolvedUserName}
                  className="h-full w-full object-cover"
                />
              : <Avatar width={40} height={40} />}
          </div>
          <div className="hidden flex-col leading-[1.2] sm:flex">
            <span className="text-[14px] font-semibold text-[#111827]">
              {resolvedUserName}
            </span>
            <span className="text-[11px] text-[#8A94A6]">
              {userRole}
            </span>
          </div>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="sm:hidden flex items-center justify-center h-8 w-8 rounded-lg text-[#62748E] hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-gray-100 bg-white px-4 py-2 flex flex-col gap-1">
          <NavLink
            to="/home"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-[#62748E] hover:text-[#1a1d23] hover:bg-gray-100"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/upload"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-[#62748E] hover:text-[#1a1d23] hover:bg-gray-100"
              }`
            }
          >
            Upload File
          </NavLink>
        </nav>
      )}
    </header>
  );
};

export default RTNavbar;
