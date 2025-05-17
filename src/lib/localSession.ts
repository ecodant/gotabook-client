import { User } from "./types";

export const dummyUser: User = {
  id: "6826c12a7eee3f0bd04564517",
  username: "NNN",
  email: "test0@test.com",
  password: "uni123",
  role: "READER",
  registrationDate: new Date("2025-05-16T04:38:02.805+00:00"),
};

export const storeSellerToLocalStorage = (seller: User) => {
  localStorage.setItem("loggedInSeller", JSON.stringify(seller));
};

export const getLocalSeller = (): User => {
  const userString = localStorage.getItem("currentUser");
  if (userString) {
    return JSON.parse(userString);
  } else return dummyUser;
};
