import { useEffect, useRef, useState } from "react";
import type { User } from "../../types/user";
import userIcon from "../../assets/userIcon.svg";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/authService";

type Props = {
  user: User;
};

export default function UserProfileComponent({ user }: Props) {
  const [open, setOpen] = useState(false);
  const { setUserAuthenticated } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      const result = await authService.logout();

      if (result?.error === null) {
        setUserAuthenticated(false);
        window.location.href = "/login";
      } else if (result?.error === "invalid_token_error") {
        alert("Invalid session. Please log in again.");
        setUserAuthenticated(false);
        window.location.href = "/login";
      } else if (result?.error === "no_session_error") {
        alert("No active session found.");
        setUserAuthenticated(false);
        window.location.href = "/login";
      } else {
        alert("Unexpected logout response. Please try again.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 focus:outline-none px-8"
      >
        <img
          src={userIcon}
          alt={user.data.name}
          className="w-7 h-7 rounded-full border border-gray-300 shadow-sm"
        />
        <span className="text-sm font-medium text-gray-700">
          {user.data.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 mx-8 bg-white border rounded-lg shadow-lg z-50">
          <div className="px-4 py-2 text-sm text-gray-600 border-b">
            Signed in as <br />
            <span className="w-full font-semibold">{user.data.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-200 rounded-b-lg"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
