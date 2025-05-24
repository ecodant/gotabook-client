import api from "./api";

export const statsService = {
  /**
   * Get loan statistics for a specific user
   * @param userId User ID to get statistics for
   * @returns Text file response containing user loan statistics
   */
  getUserLoanStats: async (userId: string): Promise<Blob> => {
    const response = await api.get(`/api/stats/user-loans/${userId}`, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Get a list of most rated books in the system
   * @param limit Number of books to include in the report (default: 10)
   * @returns Text file response containing most rated books
   */
  getMostRatedBooks: async (limit: number = 10): Promise<Blob> => {
    const response = await api.get(`/api/stats/most-rated-books`, {
      params: { limit },
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Get readers with the most friends
   * @param limit Number of users to include in the report (default: 10)
   * @returns Text file response containing users with most friends
   */
  getReadersWithMostFriends: async (limit: number = 10): Promise<Blob> => {
    const response = await api.get(`/api/stats/readers-with-most-friends`, {
      params: { limit },
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Get the shortest friendship path between two users
   * @param userId1 First user ID
   * @param userId2 Second user ID
   * @returns Text file response containing the shortest path
   */
  getShortestPath: async (userId1: string, userId2: string): Promise<Blob> => {
    const response = await api.get(`/api/stats/path/${userId1}/${userId2}`, {
      responseType: "blob",
    });
    return response.data;
  },
};
