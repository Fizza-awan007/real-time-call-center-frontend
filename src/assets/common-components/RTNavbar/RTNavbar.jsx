import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Avatar from "../../RTIcons/Avatar";
import LogoIcon from "../../RTIcons/Logo";
import { removeAccessToken } from "../../../utils/localStorage";

const RTNavbar = ({
  userName,
  userRole = "Admin",
  avatarSrc = null
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleLogoutClick = () => {
    setProfileOpen(false);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    await removeAccessToken();
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
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

          <div className="flex items-center gap-2.5 relative">
            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Avatar name={resolvedUserName} width={37} height={37} />
              </div>
              <div className="hidden flex-col leading-[1.2] sm:flex">
                <span className="text-[14px] font-semibold text-[#111827]">
                  {resolvedUserName}
                </span>
                <span className="text-[11px] text-[#8A94A6]">
                  {userRole}
                </span>
              </div>
            </div>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <button
                  onClick={handleLogoutClick}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}

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

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none px-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={cancelLogout}
          />
          
          {/* Modal Container */}
          <div className="relative mx-auto my-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="relative flex w-full flex-col rounded-2xl border-0 bg-white shadow-2xl outline-none focus:outline-none overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-solid border-slate-100">
                <h3 className="text-xl font-bold text-gray-900">
                  Confirm Logout
                </h3>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-600 transition-colors outline-none focus:outline-none"
                  onClick={cancelLogout}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {/* Body */}
              <div className="relative p-8 flex-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Are you sure?</h4>
                  <p className="text-gray-500 leading-relaxed">
                    You are about to log out. You will need to login again to access your account.
                  </p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-center p-6 border-t border-solid border-slate-100 bg-gray-50/50 gap-4">
                <button
                  className="flex-1 px-6 py-3 rounded-xl text-gray-700 bg-white border border-gray-200 font-semibold hover:bg-gray-50 transition-all duration-200 outline-none focus:ring-2 focus:ring-gray-200"
                  type="button"
                  onClick={cancelLogout}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-xl text-white bg-red-600 font-semibold hover:bg-red-700 shadow-md shadow-red-200 transition-all duration-200 outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  type="button"
                  onClick={confirmLogout}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RTNavbar;
