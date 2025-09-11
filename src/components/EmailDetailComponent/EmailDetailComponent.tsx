import { useRef, useState } from "react";
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

  const [draftContent, setDraftContent] = useState<string>(
    email.isDraft ? htmlToText(email.body || "") : ""
  );
  const [draftId, setDraftId] = useState<string | null>(email.draftId || null);
  const [isEdited, setIsEdited] = useState<boolean>(false);

  const handleBack = async () => {
    if (email.isDraft && draftId && isEdited) {
      try {
        await emailService.updateDraft(draftId, draftContent, to, email.subject);
        setIsEdited(false);
        toast.success("Draft updated successfully ");
      } catch (err) {
        console.error("Failed to save draft", err);
        toast.error("Failed to save draft ");
      }
    } else if (!email.isDraft && suggestionBoxRef.current) {
      await suggestionBoxRef.current.saveDraftIfNeeded();
    }
    onClose();
  };

  const handleSend = async () => {
    if (!email.isDraft || !draftId) return;
    try {
      await emailService.sendDraft(draftId, email.threadId, draftContent, to, email.subject);
      setDraftId(null);
      setDraftContent("");
      setIsEdited(false);
      toast.success("Email sent successfully 📧");
      onClose();
    } catch (err) {
      console.error("Failed to send email", err);
      toast.error("Failed to send email ");
    }
  };


  const handleDelete = async () => {
    if (!email.isDraft || !draftId) return;
    try {
      await emailService.deleteDraft(draftId);
      setDraftId(null);
      setDraftContent("");
      setIsEdited(false);
      toast("Draft deleted 🗑️");
      onClose();
    } catch (err) {
      console.error("Failed to delete draft", err);
      toast.error("Failed to delete draft ");
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-white rounded-lg shadow-lg mx-5 py-4 px-6">
    
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-1 cursor-pointer"
        >
          ← Back
        </button>
        <span className="text-gray-500 text-sm">
          {new Date(email.date).toLocaleString()}
        </span>
      </div>

      <h2 className="text-2xl font-semibold mb-2">{email.subject}</h2>

      <p className="text-sm text-gray-600 mb-4">
        <span className="font-medium">From:</span> {from} &nbsp;|&nbsp;
        <span className="font-medium">To:</span> {to}
      </p>

      <div className="flex-1 overflow-y-auto py-4 px-2">
        <div
          className="prose max-w-full"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </div>

      {email.isDraft && draftId ? (
        <div className="mt-4 pt-4">
          <h3 className="font-semibold mb-2 text-gray-700">Draft</h3>
          <textarea
            className="w-full p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-black"
            rows={8}
            value={draftContent}
            onChange={(e) => {
              setDraftContent(e.target.value);
              setIsEdited(true);
            }}
          />
          <div className="flex justify-end mt-3 gap-2">
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
            >
              Delete Draft
            </button>
            <button
              onClick={handleSend}
              className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        !email.isDraft && email.aiSuggestion === "applicable" && (
          <AiSuggestionBox ref={suggestionBoxRef} email={email} onClose={onClose} />
        )
      )}
    </div>
  );
}
