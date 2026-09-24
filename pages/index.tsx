import AddYourFirstBook from "@/components/AddYourFirstBook";
import IndexBanner from "@/components/banners/IndexBanner";
import ListSection from "@/components/ListSection";
import LoaderCircle from "@/components/LoaderCircle";
import SearchIndex from "@/components/SearchIndex";
import useLoad from "@/hooks/useLoad";
import useLocalStorage from "@/hooks/useLocalStorage";
import useTitles from "@/hooks/useTitles";
import { animated, useSpring } from "@react-spring/web";
import { animateOpacity, len } from "@/utils/helpers";
import { BookAdapters } from "@/adapters/book.adapters";
import { showNotifications } from "@/utils/notifications";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { zeroAtom } from "@/utils/atoms";
import type { Book, Component, ArgsSync } from "@/utils/types";
import { type Auth, getAuth, onAuthStateChanged, type Unsubscribe } from "firebase/auth";
import { AuthAction, type User, useUser, withUser } from "next-firebase-auth";

export default withUser({
  whenAuthed: AuthAction.RENDER,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  LoaderComponent: LoaderCircle,
})(Index);

function Index(): Component {
  const user: User = useUser(),
    auth: Auth = getAuth(),
    [myBooks, setMyBooks] = useState<Book[]>([]),
    UID: string = user.id as string,
    profileName: string = user?.displayName as string,
    [cacheBooks, setCacheBooks] = useLocalStorage<Book[] | null>("cache-books", null),
    [, setAllTitles] = useLocalStorage<string[]>("all-titles", []),
    [booksIsEmpty, setBooksIsEmpty] = useState<boolean | null>(null),
    { startLoading, isLoading, finishLoading } = useLoad(),
    [newNoti] = useLocalStorage("added", false),
    [deletedNoti] = useLocalStorage("deleted", false),
    [zeroBooks] = useRecoilState<boolean>(zeroAtom),
    showFirstBookMsg: boolean = booksIsEmpty || zeroBooks,
    [nameuser] = useLocalStorage("username", ""),
    username: string = nameuser.trim() == "" ? profileName : nameuser,
    [styles, api] = useSpring(() => animateOpacity(1, 1000)),
    { updateTitles } = useTitles(),
    argsSync: ArgsSync = {
      UID,
      cacheBooks,
      setCacheBooks,
      setMyBooks,
      setAllTitles,
    },
    syncUnsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    showNotifications(newNoti, deletedNoti);
    if (!navigator.onLine) return;
    const unsub = BookAdapters.syncBooks(argsSync);
    if (unsub) syncUnsubRef.current = unsub;
    return () => {
      if (syncUnsubRef.current) {
        syncUnsubRef.current();
        syncUnsubRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!navigator.onLine) return;
    const unsub: Unsubscribe = onAuthStateChanged(auth, () => {});
    return () => unsub();
  }, [auth]);

  useEffect(() => animateList(), [myBooks]);

  useEffect(() => {
    if (Array.isArray(cacheBooks)) {
      setMyBooks(cacheBooks);
    }
  }, [cacheBooks]);

  useEffect(() => {
    fetchBooks();
  }, [user]);

  useEffect(() => {
    if (zeroBooks) return;
    if (len(myBooks) > 0) {
      setCacheBooks(myBooks);
      updateTitles(myBooks);
    }
  }, [myBooks, user, zeroBooks]);

  async function fetchBooks(): Promise<void> {
    if (zeroBooks) return;

    if (Array.isArray(cacheBooks) || !navigator.onLine)
      return setMyBooks(cacheBooks ?? []);

    startLoading();
    const { books, isEmpty } = await BookAdapters.getBooks(UID);
    setMyBooks(books);
    setBooksIsEmpty(isEmpty);
    setCacheBooks(books);
    updateTitles(books);
    finishLoading();
  }

  function animateList(): void {
    if (newNoti || deletedNoti) return;
    api.start(animateOpacity(1, 400));
  }

  if (isLoading) return <LoaderCircle />;

  return (
    <animated.main
      style={styles}
      className="flex flex-col justify-start items-center w-full sm:max-w-[950px] h-full gap-y-6"
    >
      <IndexBanner username={username} />
      <SearchIndex />
      {showFirstBookMsg ? (
        <AddYourFirstBook />
      ) : (
        <ListSection myBooks={myBooks} isSearch={false} />
      )}
    </animated.main>
  );
}
