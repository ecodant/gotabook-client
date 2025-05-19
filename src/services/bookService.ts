import { Book, BookCreateInput, BookUpdateInput } from "@/lib/types";
import api from "./api";

export const bookService = {
  getAllBooks: async (): Promise<Book[]> => {
    const response = await api.get("/api/books/");
    return response.data;
  },

  getBookById: async (id: string): Promise<Book> => {
    const response = await api.get(`/api/books/${id}`);
    return response.data;
  },

  createBook: async (bookData: BookCreateInput): Promise<Book> => {
    const response = await api.post("/api/books/", bookData);
    return response.data;
  },

  updateBook: async (
    id: string,
    bookData: Partial<BookUpdateInput>
  ): Promise<Book> => {
    const response = await api.put(`/api/books/${id}`, bookData);
    return response.data;
  },

  deleteBook: async (id: string): Promise<void> => {
    await api.delete(`/api/books/${id}`);
  },
};
