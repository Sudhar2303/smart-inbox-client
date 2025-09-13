import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { Email } from "../../types/email";
import DOMPurify from "dompurify";
import emailService from "../../services/emailService";
import type { AiSuggestionBoxRef } from "../AiSuggestionBoxComponent/AiSuggestionBoxComponent";
import AiSuggestionBox from "../AiSuggestionBoxComponent/AiSuggestionBoxComponent";

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
}

const cleanEmail = (emailString: string): string => {
  const match = emailString.match(/<(.*?)>/);
  if (match) return match[1];
  return emailString.replace(/["<>]/g, "").trim();
};

export default function EmailDetailComponent({ email, onClose }: EmailDetailProps) {
  const safeHtml = DOMPurify.sanitize(email.body || "");
  const suggestionBoxRef = useRef<AiSuggestionBoxRef>(null);

  const from = cleanEmail(email.from || "");
  const to = cleanEmail(email.to || "");

  const htmlToText = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const [emailSubject] = useState<string>(email.subject || "");
  const [draftContent, setDraftContent] = useState<string>(
    email.isDraft ? htmlToText(email.body || "") : ""
  );
  const [draftId] = useState<string | null>(email.draftId || null);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<null | "back" | "send" | "delete">(null);

  const [meetingStatus, setMeetingStatus] = useState<"no" | "available" | "conflict">("no");
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [meetingFlags, setMeetingFlags] = useState<{ isDuplicate: boolean; hasConflict: boolean }>({
    isDuplicate: false,
    hasConflict: false,
  });
  const [loadingMeeting, setLoadingMeeting] = useState<boolean>(false);
  const [addingEvent, setAddingEvent] = useState<boolean>(false);
  const [eventAdded, setEventAdded] = useState<boolean>(false);

  useEffect(() => {
    const analyzeMeeting = async () => {
      if (!email.subject || !email.body) return;
      setLoadingMeeting(true);
      try {
        const res = await emailService.getMeetingInfo(email.subject, email.body);
        if (res?.data) {
          setMeetingStatus(res.data.status);
          setMeetingInfo(res.data.meeting);
          if (res.data.flags) setMeetingFlags(res.data.flags);
        }
      } catch (err) {
        console.error("Meeting analysis failed:", err);
      } finally {
        setLoadingMeeting(false);
      }
    };
    analyzeMeeting();
  }, [email.subject, email.body]);

  useEffect(() => {
    const refreshAISuggestion = async () => {
      if (
        suggestionBoxRef.current?.refreshSuggestions &&
        meetingInfo &&
        meetingStatus !== "no"
      ) {
        await suggestionBoxRef.current.refreshSuggestions({
          status: meetingStatus,
          meeting: meetingInfo,
        });
      }
    };
    refreshAISuggestion();
  }, [suggestionBoxRef.current, meetingInfo, meetingStatus]);

  const handleAddToCalendar = async () => {
    if (!meetingInfo || addingEvent || meetingFlags?.isDuplicate || eventAdded) return;
    setAddingEvent(true);
    try {
      const res = await emailService.createNewCalendarEvent(meetingInfo, emailSubject);
      if (res?.data) {
        toast.success("Event added to calendar ✅");
        setMeetingStatus("available");
        setEventAdded(true);

        if (suggestionBoxRef.current?.refreshSuggestions) {
          await suggestionBoxRef.current.refreshSuggestions({
            status: "available",
            meeting: meetingInfo,
          });
        }
      } else {
        toast.error("Failed to add event ❌");
      }
    } catch (err) {
      console.error("Add to calendar failed:", err);
      toast.error("Error while adding event");
    } finally {
      setAddingEvent(false);
    }
  };

  const handleBack = async () => {
    setLoadingAction("back");
    try {
      if (email.isDraft && draftId && isEdited) {
        await emailService.updateDraft(draftId, draftContent, to, email.subject);
        setIsEdited(false);
        toast.success("Draft updated successfully");
      } else if (!email.isDraft && suggestionBoxRef.current) {
        await suggestionBoxRef.current.saveDraftIfNeeded();
      }
      onClose();
    } catch (err) {
      console.error("Failed to save draft", err);
      toast.error("Failed to save draft");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSend = async () => {
    if (!email.isDraft || !draftId) return;
    setLoadingAction("send");
    try {
      await emailService.sendDraft(draftId, email.threadId, draftContent, to, email.subject);
      setIsEdited(false);
      toast.success("Email sent successfully 📧");
      onClose();
    } catch (err) {
      console.error("Failed to send email", err);
      toast.error("Failed to send email");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!email.isDraft || !draftId) return;
    setLoadingAction("delete");
    try {
      await emailService.deleteDraft(draftId);
      setIsEdited(false);
      toast("Draft deleted 🗑️");
      onClose();
    } catch (err) {
      console.error("Failed to delete draft", err);
      toast.error("Failed to delete draft");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-white rounded-lg shadow-lg mx-5 py-4 px-6">

      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <button
          onClick={handleBack}
          disabled={loadingAction === "back"}
          className="flex items-center gap-2 px-3 py-1 cursor-pointer disabled:opacity-50"
        >
          {loadingAction === "back" ? "⏳ Saving..." : "← Back"}
        </button>
        <span className="text-gray-500 text-sm">
          {new Date(email.date).toLocaleString()}
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold mb-1 flex-shrink-0">{email.subject}</h2>

      <p className="text-sm text-gray-600 mb-2 flex-shrink-0">
        <span className="font-medium">From:</span> {from} &nbsp;|&nbsp;
        <span className="font-medium">To:</span> {to}
      </p>

      {email.isDraft && draftId ? (
        <div className="flex flex-col flex-1 overflow-hidden mt-2">
          <h3 className="font-semibold mb-2 text-gray-700 flex-shrink-0">Draft</h3>
          <textarea
            className="flex-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none text-black resize-none mb-3"
            value={draftContent}
            onChange={(e) => {
              setDraftContent(e.target.value);
              setIsEdited(true);
            }}
          />
          <div className="flex justify-end gap-2 flex-shrink-0">
            <button
              onClick={handleDelete}
              disabled={loadingAction === "delete"}
              className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition disabled:opacity-50"
            >
              {loadingAction === "delete" ? "Deleting..." : "Delete Draft"}
            </button>
            <button
              onClick={handleSend}
              disabled={loadingAction === "send"}
              className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loadingAction === "send" ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden mt-2">
          <div className="flex-1 overflow-y-auto py-2 px-2">
            <div
              className="prose max-w-full"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </div>

          {loadingMeeting && (
            <p className="text-sm text-gray-500">Analyzing meeting info...</p>
          )}

          {(meetingStatus === "available" || meetingStatus === "conflict") && meetingInfo && (
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                {meetingStatus === "conflict" && (
                  <p className="text-red-500 text-sm">
                    ⚠️ This meeting conflicts with another event.
                  </p>
                )}
                {meetingFlags?.isDuplicate && (
                  <span className="text-yellow-500 text-sm">
                    ⚠️ This meeting already exists.
                  </span>
                )}
              </div>

              <div>
                <button
                  onClick={handleAddToCalendar}
                  disabled={addingEvent || meetingFlags?.isDuplicate || eventAdded}
                  className="bg-blue-500 text-white px-4 py-1 mx-10 rounded-md hover:bg-green-600 transition disabled:opacity-50"
                >
                  {eventAdded ? "Added to Calendar" : addingEvent ? "Adding..." : " Add to Calendar"}
                </button>
              </div>
            </div>
          )}


          {email.aiSuggestion === "applicable" && (
            <AiSuggestionBox ref={suggestionBoxRef} email={email} onClose={onClose} />
          )}
        </div>
      )}
    </div>
  );
}
