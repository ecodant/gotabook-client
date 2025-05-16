import { Message, MessageCreateInput } from "@/lib/types";
import api from "./api";

export const messageService = {
  sendMessage: async (messageData: MessageCreateInput): Promise<Message> => {
    const response = await api.post("/api/messages", messageData);
    return response.data;
  },

  getMessagesByReceiver: async (receiverId: string): Promise<Message[]> => {
    const response = await api.get(`/api/messages/receiver/${receiverId}`);
    return response.data;
  },

  getMessagesBySender: async (senderId: string): Promise<Message[]> => {
    const response = await api.get(`/api/messages/sender/${senderId}`);
    return response.data;
  },

  getUnreadMessages: async (receiverId: string): Promise<Message[]> => {
    const response = await api.get(`/api/messages/unread/${receiverId}`);
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<Message> => {
    const response = await api.get(`/api/messages/read/${messageId}`);
    return response.data;
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/api/messages/${messageId}`);
  },
};
