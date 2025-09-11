import { useEffect, useState } from "react";
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

  return (
    <div className="h-screen flex flex-col">

      <div className="flex justify-between items-center px-4 py-2 shadow z-10 bg-white">
        <HeaderComponent />
        {isAuthenticated && user && <UserProfileComponent user={user} />}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <SidebarComponent />
        </div>

        <div className="flex-1 overflow-y-auto mt-2">
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
