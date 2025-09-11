export interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string; 
  snippet: string;
  body: string;
  aiSuggestion?: "applicable" | "not_applicable"; 
  draftId?: string; 
  isDraft: true;
  isRead?: boolean; 
}


export type EmailDetailResponse = {
  message: string;
  error: string | null;
  data: Email;
};

export type EmailResponse = {
  message: string;
  error: string | null;
  data: {
    page?: number;
    emails: Email[];
  };
};
