import { z } from "zod";

// Base schema with common fields
const BaseSchema = z.object({
  id: z.string(), // ObjectId represented as string
});

export const UserSchema = BaseSchema.extend({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["READER", "ADMIN"]),
  registrationDate: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

// Input types for User operations
export type UserLoginInput = {
  email: string;
  password: string;
};

export type UserRegisterInput = Omit<User, "id" | "registrationDate">;
export type UserUpdateInput = Partial<
  Omit<User, "id" | "registrationDate" | "role">
>;

// ==================== BOOK ====================
export const BookSchema = BaseSchema.extend({
  title: z.string(),
  author: z.string(),
  year: z.number().int().positive(),
  category: z.string(),
  status: z.enum(["AVAILABLE", "BORROWED"]),
  averageRating: z.number().min(0).max(5),
});

export type Book = z.infer<typeof BookSchema>;

// Input types for Book operations
export type BookCreateInput = Omit<Book, "id" | "averageRating">;
export type BookUpdateInput = Partial<Omit<Book, "id" | "averageRating">>;

// ==================== LOAN ====================
export const LoanSchema = BaseSchema.extend({
  bookId: z.string(),
  userId: z.string(),
  loanDate: z.coerce.date(),
  returnDate: z.coerce.date().optional(),
  status: z.enum(["BORROWED", "RETURNED", "WAITING"]),
});

export type Loan = z.infer<typeof LoanSchema>;

// Input types for Loan operations
export type LoanCreateInput = {
  bookId: string;
  userId: string;
};

export type LoanUpdateInput = Partial<Pick<Loan, "returnDate" | "status">>;

// ==================== RATING ====================
export const RatingSchema = BaseSchema.extend({
  bookId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  date: z.coerce.date(),
});

export type Rating = z.infer<typeof RatingSchema>;

// Input types for Rating operations
export type RatingCreateInput = {
  bookId: string;
  userId: string;
  rating: number;
  comment?: string;
};

export type RatingUpdateInput = Partial<Pick<Rating, "rating" | "comment">>;

// ==================== MESSAGE ====================
export const MessageSchema = BaseSchema.extend({
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  date: z.coerce.date(),
  read: z.boolean(),
});

export type Message = z.infer<typeof MessageSchema>;

// Input types for Message operations
export type MessageCreateInput = {
  receiverId: string;
  content: string;
};

export type MessageUpdateInput = Partial<Pick<Message, "read">>;

// ==================== WAITLIST ====================
export const WaitlistEntrySchema = BaseSchema.extend({
  bookId: z.string(),
  userId: z.string(),
  requestDate: z.coerce.date(),
  priority: z.number().int().positive(),
});

export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;

// Input types for Waitlist operations
export type WaitlistCreateInput = {
  bookId: string;
  userId: string;
};

export type WaitlistUpdateInput = {
  priority?: number;
};

// ==================== EXPORTS ====================
export const Schemas = {
  User: UserSchema,
  Book: BookSchema,
  Loan: LoanSchema,
  Rating: RatingSchema,
  Message: MessageSchema,
  WaitlistEntry: WaitlistEntrySchema,
};

export type Types = {
  User: User;
  Book: Book;
  Loan: Loan;
  Rating: Rating;
  Message: Message;
  WaitlistEntry: WaitlistEntry;
};

export type InputTypes = {
  UserLoginInput: UserLoginInput;
  UserRegisterInput: UserRegisterInput;
  UserUpdateInput: UserUpdateInput;
  BookCreateInput: BookCreateInput;
  BookUpdateInput: BookUpdateInput;
  LoanCreateInput: LoanCreateInput;
  LoanUpdateInput: LoanUpdateInput;
  RatingCreateInput: RatingCreateInput;
  RatingUpdateInput: RatingUpdateInput;
  MessageCreateInput: MessageCreateInput;
  MessageUpdateInput: MessageUpdateInput;
  WaitlistCreateInput: WaitlistCreateInput;
  WaitlistUpdateInput: WaitlistUpdateInput;
};
