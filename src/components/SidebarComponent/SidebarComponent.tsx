import { NavLink } from "react-router-dom";
import { Mail, FileText } from "lucide-react";

export default function SidebarComponent() {
  const navItems = [
    { name: "Inbox", path: "/inbox", icon: <Mail size={18} /> },
    { name: "Drafts", path: "/drafts", icon: <FileText size={18} /> },
  ];

  return (
    <div className="w-60 h-full bg-slate-100 px-2 py-4 mx-2 my-2 flex flex-col rounded-md">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) =>
          item.name === "Drafts" ? (
            <div
              key={item.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
            >
              {item.icon}
              {item.name}
              <span className="ml-auto text-xs italic">(coming soon)</span>
            </div>
          ) : (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition 
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          )
        )}
      </nav>
    </div>
  );
}
