// src/services/emailService.ts
import axiosInstance from "../utils/axiosInstance";
import type { EmailDetailResponse, EmailResponse } from "../types/email";

const emailService = {
  getEmails: async (page: number): Promise<EmailResponse> => {
    const response = await axiosInstance.get<EmailResponse>(`/gmail/emails?page=${page}`);
    return response.data;
  },
  getEmailById: async (id: string): Promise<EmailDetailResponse> => {
    const response = await axiosInstance.get<EmailDetailResponse>(`/gmail/emails/${id}`);
    return response.data;
  },

  generateAISuggestion: async (emailBody: string, threadId: string) => {
    const res = await axiosInstance.post("/gmail/emails/aisuggest", { emailBody, threadId });
    return res.data;
  },

  createDraft: async (threadId: string, body: string, to: string, subject: string) => {
    const res = await axiosInstance.post("/gmail/draft/", { threadId, body, to, subject });
    return res.data;
  },

  updateDraft: async (draftId: string, body: string, to: string, subject: string) => {
    const res = await axiosInstance.put(`/gmail/draft/update`, { draftId,body,to,subject });
    return res.data;
  },

  deleteDraft: async (draftId: string) => {
    const res = await axiosInstance.delete(`/gmail/draft/${draftId}`);
    return res.data;
  },

  sendDraft:async (draftId: string,threadId: string, body: string, to: string, subject: string) => {
    const res = await axiosInstance.post(`gmail/draft/send`,{ draftId , threadId, body, to, subject });
    return res.data;
  },
};

export default emailService;
