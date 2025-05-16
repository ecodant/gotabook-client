import { WaitlistEntry, WaitlistCreateInput } from "@/lib/types";
import api from "./api";

export const waitlistService = {
  addToWaitlist: async (
    waitlistData: WaitlistCreateInput
  ): Promise<WaitlistEntry> => {
    const response = await api.post("/api/waitlist", waitlistData);
    return response.data;
  },

  getAllWaitlistEntries: async (): Promise<WaitlistEntry[]> => {
    const response = await api.get("/api/waitlist");
    return response.data;
  },

  getWaitlistEntryById: async (id: string): Promise<WaitlistEntry> => {
    const response = await api.get(`/api/waitlist/${id}`);
    return response.data;
  },

  getWaitlistByBook: async (bookId: string): Promise<WaitlistEntry[]> => {
    const response = await api.get(`/api/waitlist/book/${bookId}`);
    return response.data;
  },

  getWaitlistByUser: async (userId: string): Promise<WaitlistEntry[]> => {
    const response = await api.get(`/api/waitlist/user/${userId}`);
    return response.data;
  },

  getWaitlistByBookAndUser: async (
    bookId: string,
    userId: string
  ): Promise<WaitlistEntry> => {
    const response = await api.get(
      `/api/waitlist/p/?bookId=${bookId}&userId=${userId}`
    );
    return response.data;
  },

  getWaitlistAfterDate: async (date: Date): Promise<WaitlistEntry[]> => {
    const response = await api.get(
      `/api/waitlist/after-date?date=${date.toISOString()}`
    );
    return response.data;
  },

  getWaitlistCountByBook: async (bookId: string): Promise<number> => {
    const response = await api.get(`/api/waitlist/count/book/${bookId}`);
    return response.data;
  },

  getWaitlistCountByUser: async (userId: string): Promise<number> => {
    const response = await api.get(`/api/waitlist/count/user/${userId}`);
    return response.data;
  },

  removeFromWaitlist: async (bookId: string, userId: string): Promise<void> => {
    await api.delete(`/api/waitlist?bookId=${bookId}&userId=${userId}`);
  },

  removeAllForBook: async (bookId: string): Promise<void> => {
    await api.delete(`/api/waitlist/book/${bookId}`);
  },

  removeAllForUser: async (userId: string): Promise<void> => {
    await api.delete(`/api/waitlist/user/${userId}`);
  },

  updatePriority: async (
    id: string,
    priority: number
  ): Promise<WaitlistEntry> => {
    const response = await api.put(`/api/waitlist/${id}/priority`, {
      priority,
    });
    return response.data;
  },
};
