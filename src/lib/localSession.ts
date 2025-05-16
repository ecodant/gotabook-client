import { Seller } from "./types";

export const dummySeller: Seller = {
  id: "seller1",
  name: "001",
  email: "johndoe@example.com",
  password: "password123",
  lastName: "Doe",
  license: "1234567890",
  address: "123 Main St",
  profileImg: "https://example.com/profile.jpg",
  reviews: [],
  contacts: [],
  notifications: [],
  products: [],
  chats: [],
  contactRequests: [],
};

export const storeSellerToLocalStorage = (seller: Seller) => {
  localStorage.setItem("loggedInSeller", JSON.stringify(seller));
};

export const getLocalSeller = (): Seller => {
  const sellerString = localStorage.getItem("loggedInSeller");
  if (sellerString) {
    console.log("verdad");
    return JSON.parse(sellerString);
  } else return dummySeller;
};
