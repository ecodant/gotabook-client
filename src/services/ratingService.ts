import { Rating, RatingCreateInput, RatingUpdateInput } from "@/lib/types";
import api from "./api";

export const ratingService = {
  createRating: async (ratingData: RatingCreateInput): Promise<Rating> => {
    const response = await api.post("/api/ratings", ratingData);
    return response.data;
  },

  getRatingById: async (id: string): Promise<Rating> => {
    const response = await api.get(`/api/ratings/${id}`);
    return response.data;
  },

  getRatingsByBookId: async (bookId: string): Promise<Rating[]> => {
    const response = await api.get(`/api/ratings/book/${bookId}`);
    return response.data;
  },

  getRatingsByUserId: async (userId: string): Promise<Rating[]> => {
    const response = await api.get(`/api/ratings/user/${userId}`);
    return response.data;
  },

  updateRating: async (
    id: string,
    ratingData: Partial<RatingUpdateInput>
  ): Promise<Rating> => {
    const response = await api.put(`/api/ratings/${id}`, ratingData);
    return response.data;
  },

  deleteRating: async (id: string): Promise<void> => {
    await api.delete(`/api/ratings/${id}`);
  },
};
