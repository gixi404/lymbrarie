import { DB } from "@/database/initAuth";
import { collection, type CollectionReference } from "firebase/firestore";
import type { Book, BookData } from "./types";
import { BOOK_STATES } from "./states";

const BASE_URL: string = "https://lymbrarie.vercel.app";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ducssjlkl/image/upload";

const COLLECTION_BOOKS: CollectionReference = collection(DB, "lymbrarie_books");
const COLLECTION_USERS: CollectionReference = collection(DB, "lymbrarie_users");

const API_BOOKS: string = "https://www.googleapis.com/books/v1/volumes";

const GENDERS: string[] = [
  "Personalizado",
  "Sin asignar",
  "Ficción",
  "No ficción",
  "Religión",
  "Misterio",
  "Fantasía",
  "Ensayo",
  "Romance",
  "Terror",
  "Thriller",
  "Novela",
  "Historia",
  "Biografía",
  "Autoayuda",
  "Poesía",
  "Drama",
  "Aventura",
  "Psicología",
  "Juvenil",
  "Infantil",
  "Filosofía",
  "Economía",
  "Policial",
  "Ciencia",
  "Distopía",
] as const;

const EMPTY_BOOK: Book = {
  id: "",
  data: {
    title: "",
    author: "",
    state: BOOK_STATES.PENDING.es,
    image: "",
    gender: "Sin asignar",
    notes: "",
    loaned: "",
    isFav: false,
  },
} as const;

const EMPTY_BOOK_DATA: BookData = {
  title: "",
  author: "",
  state: BOOK_STATES.PENDING.es,
  image: "",
  gender: "Sin asignar",
  notes: "",
  loaned: "",
  isFav: false,
};

const BOOK_RECO: BookData = {
  owner: "all",
  title: "¡Viven! - La tragedia de los Andes",
  state: BOOK_STATES.RECOMMENDED.es,
  author: "Piers Paul Read",
  image:
    "https://res.cloudinary.com/dgs55s8qh/image/upload/v1743807173/rtbw9ominfxxqqhljpzc.webp",
  gender: "Historia",
  loaned: "",
  notes:
    "En 1972 un avión que partía desde Montevideo a Santiago de Chile se estrelló en los Andes, en un sitio desolado e inaccesible. Los sobrevivientes, un grupo de jóvenes jugadores de rugby, se enfrentaron a la adversidad y a la muerte para sobrevivir. La historia de su lucha por la vida es un testimonio de la resistencia humana y la fuerza del espíritu.",
  isFav: false,
} as const;

const PAGES: Pages = {
  GUEST: "/guest",
  SEARCH: "/search",
  HOME: "/",
  LOGIN: "/login",
  PROFILE: "/profile",
  CONFIG: "/config",
  FAQ: "/faq",
  TERMSOFUSE: "/termsofuse",
  PRIVACYPOLICY: "/privacypolicy",
  DONATIONS: "/donations",
  BOOK: "/book",
  RECOMMENDATION: "/recommendation",
  ERROR: "/error",
};

export {
  BASE_URL,
  CLOUDINARY_URL,
  COLLECTION_BOOKS,
  COLLECTION_USERS,
  EMPTY_BOOK,
  EMPTY_BOOK_DATA,
  GENDERS,
  BOOK_RECO,
  API_BOOKS,
  PAGES,
};

interface Pages {
  GUEST: string;
  SEARCH: string;
  HOME: string;
  LOGIN: string;
  PROFILE: string;
  CONFIG: string;
  FAQ: string;
  TERMSOFUSE: string;
  PRIVACYPOLICY: string;
  DONATIONS: string;
  BOOK: string;
  RECOMMENDATION: string;
  ERROR: string;
}
