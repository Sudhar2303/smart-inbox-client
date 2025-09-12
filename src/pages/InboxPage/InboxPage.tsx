import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import SidebarComponent from "../../components/SidebarComponent/SidebarComponent";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import UserProfileComponent from "../../components/UserProfileComponent/UserProfileComponent";
import EmailListComponent from "../../components/EmailListComponent/EmailListComponent";
import EmailDetailComponent from "../../components/EmailDetailComponent/EmailDetailComponent";
import emailService from "../../services/emailService";
import { userService } from "../../services/userService";
import type { Email, EmailResponse } from "../../types/email";
import type { User } from "../../types/user";

export default function InboxPage() {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  const [emails, setEmails] = useState<Email[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUser = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response: EmailResponse = await emailService.getEmails(page);
      if (response.error === null && response.data?.emails) {
        setEmails(response.data.emails);
      }
    } catch (err) {
      console.error("Failed to fetch emails", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchEmails();
  }, [page, isAuthenticated, refresh]);

  const triggerRefresh = () => {
    setRefresh((prev) => !prev);
  };

  const openEmail = async (id: string) => {
    setLoading(true);
    try {
      const response = await emailService.getEmailById(id);
      if (response.error === null && response.data) {
        setSelectedEmail(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch email detail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center px-4 py-2 shadow z-20 bg-white">
        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <HeaderComponent />
        </div>
        {isAuthenticated && user && <UserProfileComponent user={user} />}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 flex md:hidden">
            <div
              ref={sidebarRef}
              className="relative w-64 bg-white shadow-md flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-bold text-gray-800 text-lg">Menu</span>
                <button
                  className="p-1 rounded-md hover:bg-gray-200"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
              </div>
              <SidebarComponent />
            </div>
            <div
              className="flex-1 bg-black bg-opacity-30"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        <div className="hidden md:block w-64 flex-shrink-0">
          <SidebarComponent />
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedEmail ? (
            <EmailDetailComponent
              email={selectedEmail}
              onClose={() => {
                setSelectedEmail(null);
                triggerRefresh();
              }}
            />
          ) : (
            <EmailListComponent
              emails={emails}
              page={page}
              onNext={() => setPage((p) => p + 1)}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onRefresh={triggerRefresh}
              loading={loading}
              onSelectEmail={(id) => openEmail(id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
