import { useState } from "react";
import type { Email } from "../../types/email";

interface EmailListProps {
  emails: Email[];
  page: number;
  onNext: () => void;
  onPrev: () => void;
  onRefresh: () => void;
  loading: boolean;
  onSelectEmail: (id: string) => void;
}

export default function EmailListComponent({
  emails,
  page,
  onNext,
  onPrev,
  onRefresh,
  loading,
  onSelectEmail,
}: EmailListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getDisplayName = (email: Email) => {
    if (email.draftId) return email.to;
    const match = email.from.match(/^(.*?)</);
    return match ? match[1].trim() : email.from;
  };

  const handleClick = (id: string) => {
    setSelectedId(id);
    onSelectEmail(id);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm mx-5">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 text-sm">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-2 py-1 text-xs bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-md disabled:opacity-50"
        >
          ⟳ Refresh
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPrev}
            disabled={page === 1 || loading}
            className="px-2 py-1 text-sm hover:bg-gray-100 rounded disabled:opacity-40"
          >
            &lt;
          </button>
          <span className="text-xs text-gray-500">{page}</span>
          <button
            onClick={onNext}
            disabled={loading}
            className="px-2 py-1 text-sm hover:bg-gray-100 rounded disabled:opacity-40"
          >
            &gt;
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Loading...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => handleClick(email.id)}
              className={`flex items-center px-3 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 text-sm ${
                selectedId === email.id ? "bg-blue-50" : ""
              }`}
            >
              <span
                className={`flex-shrink-0 w-32 truncate ${
                  email.isRead ? "text-gray-700" : "font-semibold text-gray-900"
                }`}
              >
                {getDisplayName(email)}
              </span>

              {email.draftId && (
                <span className="flex-shrink-0 text-red-500 text-xs font-medium ml-3 mr-1">
                  Draft
                </span>
              )}

              <span
                className={`flex-grow truncate overflow-hidden ml-4 ${
                  email.isRead ? "text-gray-600" : "font-medium text-gray-800"
                }`}
              >
                {email.subject} – {email.snippet || "No preview"}
              </span>

              <span className="flex-shrink-0 w-20 text-xs text-gray-500 text-right ml-4">
                {new Date(email.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
