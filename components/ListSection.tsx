import BookCard from "./BookCard";
import DetailsBtn from "./btns/DetailsBtn";
import FavoritesBtn from "./btns/FavoritesBtn";
import ListBooks from "./ListBooks";
import NoMatchesText from "./NoMatchesText";
import SortBtn from "./btns/SortBtn";
import useLocalStorage from "@/hooks/useLocalStorage";
import { deburr, delay, isEqual, isNull, orderBy, shuffle } from "es-toolkit";
import { len, mapStateToEnglish, pathIs, tLC } from "@/utils/helpers";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { PAGES } from "@/utils/consts";
import { useRecoilState } from "recoil";
import {
  scrollAtom,
  searchAtom,
  shuffleAtom,
  stateAtom,
  showFavsAtom,
} from "@/utils/atoms";
import type {
  Book,
  BookData,
  Component,
  SortModes,
  ShuffleAtom,
} from "@/utils/types";

const ListSection = memo(function B(props: Props) {
  const { myBooks, isSearch } = props,
    [searchVal] = useRecoilState<string>(searchAtom),
    [stateVal] = useRecoilState<string>(stateAtom),
    [showDetailsLS, setShowDetailsLS] = useLocalStorage("show-details", true),
    [showDetails, setShowDetails] = useState<boolean>(showDetailsLS),
    [scrollLS, setScrollLS] = useLocalStorage<number | null>("scroll-editpopup", null),
    [scroll] = useRecoilState(scrollAtom),
    [ascSortLS, setSortLS] = useLocalStorage<SortModes>("sort", "asc"),
    [ascSort, setSort] = useState<SortModes>(ascSortLS),
    [showFavs, setShowFavs] = useRecoilState<boolean>(showFavsAtom),
    [shuffledData, setShuffledData] = useRecoilState<ShuffleAtom>(shuffleAtom),
    myFavs: Book[] = useMemo(
      () => myBooks.filter((b: Book) => b?.data?.isFav),
      [myBooks]
    );

  const filteredBooks: Book[] = useMemo(() => {
    function where(value: string, state: string): Book[] {
      const checkState = (b: BookData) => {
          if (!state) return true;
          const englishStates: string[] = mapStateToEnglish(stateVal);
          return englishStates.includes(b.state ?? "");
        },
        checkTitle = (b: BookData) =>
          deburr(tLC(b.title ?? ""))?.includes(deburr(tLC(value))),
        checkAuthor = (b: BookData) =>
          deburr(tLC(b.author ?? ""))?.includes(deburr(tLC(value))),
        books: Book[] = showFavs ? myFavs : myBooks;

      return books.filter(
        (b: Book) =>
          checkState(b.data) && (checkTitle(b.data) || checkAuthor(b.data))
      );
    }
    return where(searchVal, stateVal);
  }, [searchVal, stateVal, showFavs, myBooks, myFavs]);

  useEffect(() => {
    if (pathIs(PAGES.HOME, { exact: true })) {
      requestAnimationFrame(() => {
        scrollTo({ top: scrollLS ?? scroll, behavior: "instant" });
      });

      if (!isNull(scrollLS)) {
        (async () => {
          await delay(1000);
          setScrollLS(null);
        })();
      }
    }
  }, [myBooks]);

  useEffect(() => {
    if (ascSort == "random" && len(filteredBooks) > 0) {
      const needsNewShuffle: boolean =
        !shuffledData ||
        shuffledData.version !== JSON.stringify(filteredBooks) ||
        shuffledData.mode !== "shuffle";

      if (needsNewShuffle) {
        const data: BookData[] = filteredBooks.map(b => b.data);
        setShuffledData({
          data: shuffle(data),
          version: JSON.stringify(filteredBooks),
          mode: "shuffle",
        });
      }
    }
  }, [filteredBooks, ascSort]);

  const sortedBooks: BookData[] = useMemo(() => {
    const data: BookData[] = filteredBooks.map(b => b?.data),
      order: Order = ascSort == "asc" ? ["asc", "desc"] : ["desc", "asc"];
    return ascSort == "random"
      ? shuffledData?.data || []
      : orderBy(data, ["title"], order);
  }, [filteredBooks, ascSort, shuffledData]);

  const noMatches: boolean = useMemo(() => {
    return (
      (isEqual(len(filteredBooks), 0) && !isEqual(searchVal, "")) ||
      (isEqual(len(sortedBooks), 0) && showFavs) ||
      (isEqual(searchVal, "") &&
        !isEqual(stateVal, "") &&
        isEqual(len(sortedBooks), 0))
    );
  }, [filteredBooks, sortedBooks, searchVal, showFavs, stateVal]);

  const renderBookItem = useCallback(
    (book: BookData, _index: number): Component => (
      <BookCard key={book.title} data={book} showDetails={showDetails} />
    ),
    [showDetails]
  );

  const changeDetails = useCallback((): void => {
    setShowDetails(prev => {
      const next = !prev;
      setShowDetailsLS(next);
      return next;
    });
  }, [setShowDetailsLS]);

  const toggleSort = useCallback((): void => {
    switch (ascSort) {
      case "asc":
        setSort("desc");
        setSortLS("desc");
        break;
      case "desc":
        setSort("random");
        setSortLS("random");
        break;
      default:
        setSort("asc");
        setSortLS("asc");
        break;
    }
  }, [ascSort, setSort, setSortLS]);

  return (
    <section className="w-full px-4 sm:px-0 sm:w-[620px] flex flex-col justify-between items-center gap-y-7 relative">
      {!isSearch && (
        <div className="flex justify-start w-full items-center px-2.5">
          <DetailsBtn showDetails={showDetails} onClick={changeDetails} />
          <SortBtn ascSort={ascSort} toggleSort={toggleSort} />
          <FavoritesBtn toggleFavs={() => setShowFavs(!showFavs)} />
          {showFavs && (
            <p className="pl-4 pt-0.5 text-[15px] text-slate-300/80">
              Favoritos
            </p>
          )}
        </div>
      )}
      {noMatches ? (
        <NoMatchesText
          txt={showFavs && !searchVal ? "no-favs" : "no-matches"}
        />
      ) : (
        <ListBooks listBooks={sortedBooks} renderItem={renderBookItem} showDetails={showDetails} />
      )}
    </section>
  );
});

export default ListSection;

interface Props {
  myBooks: Book[];
  isSearch: boolean;
}

type Order = ("asc" | "desc")[];
