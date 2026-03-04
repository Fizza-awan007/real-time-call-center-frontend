import Avatar from "../../RTIcons/Avatar";
import LogoIcon from "../../RTIcons/Logo";
const RTNavbar = ({
  userName,
  userRole = "Admin",
  avatarSrc = null
}) => {
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
    <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between bg-[#FFFFFF] px-4 sm:px-8">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center">
          <LogoIcon className="h-5 w-5 text-white" />
        </div>
       
      </div>

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
      </div>
    </header>
  );
};

export default RTNavbar;
