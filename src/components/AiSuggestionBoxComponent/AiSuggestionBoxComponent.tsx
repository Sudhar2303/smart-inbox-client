import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast";
import type { Email } from "../../types/email";
import emailService from "../../services/emailService";

export interface AiSuggestionBoxRef {
  saveDraftIfNeeded: () => Promise<void>;
  refreshSuggestions?: (ctx: { status: string; meeting?: any }) => Promise<void>;
}

interface AiSuggestionBoxProps {
  email: Email;
  onClose: () => void;
}

const AiSuggestionBox = forwardRef<AiSuggestionBoxRef, AiSuggestionBoxProps>(
  ({ email, onClose }, ref) => {
    const [suggestion, setSuggestion] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [draftId, setDraftId] = useState<string | null>(email.draftId || null);
    const [isEdited, setIsEdited] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);

    const cleanEmail = (emailString: string): string => {
      const match = emailString.match(/<(.*?)>/);
      if (match) return match[1];
      return emailString.replace(/["<>]/g, "").trim();
    };
    const recipient = cleanEmail(email.to);

    const fetchAISuggestion = async (status?: string, meeting?: any) => {
      setIsLoading(true);
      try {
        const res = await emailService.generateAISuggestion(
          email.body,
          email.threadId,
          status,
          meeting
        );
        if (res?.data?.suggestion) {
          setSuggestion(res.data.suggestion);
        }
      } catch (err) {
        console.error("AI suggestion failed", err);
        toast.error("Failed to load AI suggestion");
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      saveDraftIfNeeded: async () => {
        if (!isEdited || !suggestion.trim()) return;
        try {
          if (!draftId) {
            const res = await emailService.createDraft(
              email.threadId,
              suggestion,
              recipient,
              email.subject
            );
            if (res?.draftId) setDraftId(res.draftId);
          } else {
            await emailService.updateDraft(
              draftId,
              suggestion,
              recipient,
              email.subject
            );
          }
          setIsEdited(false);
          toast.success("Draft saved successfully");
        } catch (err) {
          console.error("Failed to save draft", err);
          toast.error("Failed to save draft");
        }
      },
      refreshSuggestions: async ({ status, meeting }) => {
        await fetchAISuggestion(status, meeting);
      },
    }));

    useEffect(() => {
      if (!draftId) fetchAISuggestion();
    }, [draftId]);

    const handleSend = async () => {
      if (!isEdited && !isFocused) {
        toast.error("Please review or edit the suggestion before sending");
        return;
      }
      if (!suggestion.trim()) {
        toast.error("Cannot send empty reply");
        return;
      }

      setIsSending(true);
      try {
        await emailService.sendDraft(
          draftId || "",
          email.threadId,
          suggestion,
          recipient,
          email.subject
        );
        setDraftId(null);
        setSuggestion("");
        setIsEdited(false);
        toast.success("Email sent successfully 📧");
        onClose();
      } catch (err) {
        console.error("Failed to send email", err);
        toast.error("Failed to send email");
      } finally {
        setIsSending(false);
      }
    };

    return (
      <div className="mt-4 border-t pt-4">
        <h3 className="font-semibold mb-2 text-gray-700">AI Suggested Reply</h3>

        {isLoading ? (
          <p className="text-gray-500">Generating AI suggestion...</p>
        ) : (
          <textarea
            className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none ${
              isFocused ? "text-black" : "text-gray-400"
            }`}
            rows={4}
            value={suggestion}
            placeholder="AI suggestion will appear here..."
            onFocus={() => {
              setIsFocused(true);
              setIsEdited(true);
            }}
            onChange={(e) => {
              setSuggestion(e.target.value);
              setIsEdited(true);
            }}
          />
        )}

        <div className="flex justify-end mt-3 gap-2">
          <button
            onClick={handleSend}
            disabled={isSending || isLoading}
            className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    );
  }
);

export default AiSuggestionBox;
