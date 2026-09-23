import { memo } from "react";
import BookCardSearched from "./BookCardSearched";
import CardWithDetails from "./CardWithDetails";
import CardWithOutDetails from "./CardWithoutDetails";
import Cover from "@/public/cover.webp";
import fnState from "./BookState";
import useGuest from "@/hooks/useGuest";
import { pathIs } from "@/utils/helpers";
import { PAGES } from "@/utils/consts";
import { round } from "es-toolkit";
import { scrollAtom } from "@/utils/atoms";
import { useSetRecoilState } from "recoil";
import type { BookData, Component } from "@/utils/types";
import { useRouter, type NextRouter } from "next/router";

const BookCard = memo(function BookCard({ data, showDetails }: Props): Component {
  const { push }: NextRouter = useRouter(),
    title: string = encodeURIComponent(data.title ?? ""),
    { isGuest } = useGuest(),
    img: string = data.image || Cover.src,
    setScroll = useSetRecoilState(scrollAtom),
    formatState = (): Component => fnState(data.state ?? "", showDetails),
    withDetails: Details = {
      title: data.title ?? "",
      onClick,
      formatState,
      img,
      gender: data.gender,
      author: data.author,
    } as const,
    withOutDetails: Details = {
      onClick,
      formatState,
      title: data.title ?? "",
    } as const,
    searchedProps: SearchedProps = {
      title: data.title ?? "",
      author: data.author ?? "Autor desconocido",
      image: img,
      notes: data.notes ?? "...",
      owner: data.owner ?? "Invitado",
      gender: data.gender ?? "",
      isFav: data.isFav ?? false,
      loaned: data.loaned ?? "",
      state: data.state ?? "",
      url: data.url ?? "",
    } as const;

  function onClick(): Promise<boolean> {
    if (isGuest) return guestBooks(data.title ?? "", push);
    setScroll(round(scrollY, 0));
    return push(`${PAGES.BOOK}/${title}`).catch((err) => {
      if (err?.cancelled) return false;
      return false;
    });
  }

  function renderCard(): Component {
    switch (true) {
      case pathIs(PAGES.SEARCH):
        return <BookCardSearched {...searchedProps} />;

      case showDetails:
        return <CardWithDetails {...withDetails} />;

      default:
        return <CardWithOutDetails {...withOutDetails} />;
    }
  }

  return renderCard();
});

export default BookCard;

function guestBooks(title: string, push: NextRouter["push"]): Promise<boolean> {
  const safePush = (url: string) =>
    push(url).catch((err) => {
      if (err?.cancelled) return false;
      return false;
    });

  switch (title) {
    case "Orgullo y Prejuicio":
      return safePush(`${PAGES.GUEST}/0`);

    case "Pride and Prejudice":
      return safePush(`${PAGES.GUEST}/0`);

    case "1984":
      return safePush(`${PAGES.GUEST}/1`);

    case "El Código Da Vinci":
      return safePush(`${PAGES.GUEST}/2`);

    case "The Da Vinci Code":
      return safePush(`${PAGES.GUEST}/2`);

    case "Harry Potter y la Piedra Filosofal":
      return safePush(`${PAGES.GUEST}/3`);

    case "Harry Potter and the Philosopher's Stone":
      return safePush(`${PAGES.GUEST}/3`);

    default:
      return safePush(PAGES.LOGIN);
  }
}

interface Props {
  data: BookData;
  showDetails: boolean;
}

interface Details {
  onClick: () => Promise<boolean>;
  title: string;
  formatState: () => Component;
  img?: string;
  gender?: string;
  author?: string;
}

interface SearchedProps {
  title: string;
  author: string;
  notes: string;
  image: string;
  owner: string;
  gender: string;
  isFav: boolean;
  loaned: string;
  state: string;
  url: string;
}
