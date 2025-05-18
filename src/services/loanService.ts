import { Loan, LoanCreateInput } from "@/lib/types";
import api from "./api";

export const loanService = {
  requestLoan: async (loanData: LoanCreateInput): Promise<Loan> => {
    const response = await api.post("/api/loans/", loanData);
    return response.data;
  },

  returnBook: async (id: string): Promise<Loan> => {
    const response = await api.put(`/api/loans/${id}/return`);
    return response.data;
  },
  getAllLoans: async (): Promise<Loan[]> => {
    const response = await api.get(`/api/loans/`);
    return response.data;
  },
  getLoanQueue: async (bookId: string): Promise<Loan[]> => {
    const response = await api.get(`/api/loans/queue/${bookId}`);
    return response.data;
  },
  getUserLoans: async (userId: string): Promise<Loan[]> => {
    const response = await api.get(`/api/loans/user/${userId}`);
    return response.data;
  },

  deleteLoan: async (id: string): Promise<void> => {
    await api.delete(`/api/loans/${id}`);
  },
};
