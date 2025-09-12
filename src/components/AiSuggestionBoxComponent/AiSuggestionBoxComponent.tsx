import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast";
import type { Email } from "../../types/email";
import emailService from "../../services/emailService";

export interface AiSuggestionBoxRef {
  saveDraftIfNeeded: () => Promise<void>;
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

    useEffect(() => {
      if (draftId) return;

      const fetchAISuggestion = async () => {
        setIsLoading(true);
        try {
          const res = await emailService.generateAISuggestion(
            email.body,
            email.threadId
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

      fetchAISuggestion();
    }, [email.body, email.threadId, draftId]);

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
    }));

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
            rows={6}
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
            disabled={isSending || (!isEdited && !isFocused)}
            className={`px-4 py-1 rounded-md transition text-white ${
              isSending || (!isEdited && !isFocused)
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSending ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </div>
    );
  }
);

export default AiSuggestionBox;
