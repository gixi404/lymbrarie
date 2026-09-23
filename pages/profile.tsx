import Favicon from "@/public/favicon.ico";
import Image from "next/image";
import Link from "next/link";
import LoaderCircle from "@/components/LoaderCircle";
import useGuest from "@/hooks/useGuest";
import useIsMobile from "@/hooks/useIsMobile";
import useLocalStorage from "@/hooks/useLocalStorage";
import { animated, useSpring } from "@react-spring/web";
import { animateOpacity, translateState } from "@/utils/helpers";
import { AuthAction, useUser, withUser } from "next-firebase-auth";
import { isUndefined, sum } from "es-toolkit";
import { PAGES } from "@/utils/consts";
import { BOOK_STATES } from "@/utils/states";
import { scrollAtom, stateAtom } from "@/utils/atoms";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useSetRecoilState } from "recoil";
import type { Component, Book, Timer } from "@/utils/types";

export default withUser({
  whenAuthed: AuthAction.RENDER,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.RENDER,
  LoaderComponent: LoaderCircle,
})(ProfilePage);

function ProfilePage(): Component {
  const user = useUser(),
    img = user?.photoURL as string,
    name = user?.displayName as string,
    email: string = user?.email ?? "",
    { isGuest } = useGuest(),
    [nameuser] = useLocalStorage("username", ""),
    username =
      nameuser.trim() === "" || nameuser.startsWith("U2FsdGVk") ? name : nameuser,
    [cacheBooks] = useLocalStorage<Book[] | null>("cache-books", null),
    [styles] = useSpring(() => animateOpacity(1, 400)),
    { isMobile } = useIsMobile(),
    setSelectStateVal = useSetRecoilState<string>(stateAtom),
    setScroll = useSetRecoilState(scrollAtom),
    [stateCounts, setStateCounts] = useState<States>({
      [BOOK_STATES.READ.es]: 0,
      [BOOK_STATES.READING.es]: 0,
      [BOOK_STATES.PENDING.es]: 0,
      [BOOK_STATES.LENT.es]: 0,
      [BOOK_STATES.ABANDONED.es]: 0,
      [BOOK_STATES.HALFWAY.es]: 0,
    }),
    { [BOOK_STATES.READ.es]: Read, [BOOK_STATES.READING.es]: Reading, [BOOK_STATES.PENDING.es]: Pending, [BOOK_STATES.LENT.es]: Lent, [BOOK_STATES.ABANDONED.es]: Abandoned, [BOOK_STATES.HALFWAY.es]: Halfway }: States = stateCounts;

  useEffect(() => {
    if (isGuest) return;
    if (Array.isArray(cacheBooks)) {
      const counts: States = {
        [BOOK_STATES.READ.es]: 0,
        [BOOK_STATES.READING.es]: 0,
        [BOOK_STATES.PENDING.es]: 0,
        [BOOK_STATES.LENT.es]: 0,
        [BOOK_STATES.ABANDONED.es]: 0,
        [BOOK_STATES.HALFWAY.es]: 0,
      };

      cacheBooks.forEach((b: Book) => {
        const englishState: string = b.data.state ?? "";
        const spanishState: string = translateState(englishState);
        if (!isUndefined(counts[spanishState])) counts[spanishState]++;
      });

      setStateCounts(counts);
    }
  }, [cacheBooks]);

  function changeState(state: BookState): () => void {
    if (isMobile) return () => {};
    setScroll(430); //* Posición para mostrar los libros sin scrollear manualmente
    setSelectStateVal(state);
    const timer: Timer = setTimeout(() => setScroll(0), 300);
    return () => clearTimeout(timer);
  }

  return (
    <animated.section
      style={styles}
      className="relative max-w-4xl w-full px-6 sm:px-0 mb-28 flex flex-col justify-start items-center gap-y-4"
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 bg-slate-900/40 rounded-2xl p-8 backdrop-blur-sm border border-violet-500/20">
        <div className="flex flex-col items-center gap-y-3">
          <div className="relative">
            <Image
              alt="avatar"
              className="rounded-full w-30 h-30 object-cover object-center border-4 border-violet-500/20"
              src={isGuest ? Favicon.src : img}
              width={100}
              height={100}
            />
            <div className="absolute -bottom-2.5 -right-2.5 bg-violet-500/20 p-2 rounded-full">
              <UserRound size={24} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-violet-100">
            {isGuest ? "Invitado" : username}
          </p>
          <p className="mb-5 md:mb-0 text-lg text-slate-300 lowercase">
            {isGuest ? "invitado@gmail.com" : email}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center md:border-l border-violet-500/20 md:pl-8">
          <div className="text-center space-y-2">
            <p className="text-3xl font-medium text-slate-300">Total</p>
            <p className="text-5xl font-light text-violet-200">
              {isGuest
                ? 4
                : sum([Read, Lent, Reading, Pending, Abandoned, Halfway])}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href={PAGES.HOME}
          onClick={() => changeState(BOOK_STATES.READING.es)}
          className="bg-slate-900/40 hover:bg-slate-900 backdrop-blur-sm p-6 rounded-xl border border-violet-500/20 flex flex-col items-center gap-y-2 transition-all"
        >
          <p className="text-lg font-medium text-white">
            {BOOK_STATES.READING.es}
          </p>
          <p className="text-4xl font-light text-violet-200">
            {isGuest ? 1 : Reading}
          </p>
        </Link>

        <Link
          href={PAGES.HOME}
          onClick={() => changeState(BOOK_STATES.LENT.es)}
          className="bg-slate-900/40 hover:bg-slate-900 backdrop-blur-sm p-6 rounded-xl border border-violet-500/20 flex flex-col items-center gap-y-2 transition-all"
        >
          <p className="text-lg font-medium text-white">Prestados</p>
          <p className="text-4xl font-light text-violet-200">
            {isGuest ? 1 : Lent}
          </p>
        </Link>
        <Link
          href={PAGES.HOME}
          onClick={() => changeState(BOOK_STATES.PENDING.es)}
          className="bg-slate-900/40 hover:bg-slate-900 backdrop-blur-sm p-6 rounded-xl border border-violet-500/20 flex flex-col items-center gap-y-2 transition-all"
        >
          <p className="text-lg font-medium text-white">
            {BOOK_STATES.PENDING.es}
          </p>
          <p className="text-4xl font-light text-violet-200">
            {isGuest ? 1 : Pending}
          </p>
        </Link>
        <Link
          href={PAGES.HOME}
          onClick={() => changeState(BOOK_STATES.READ.es)}
          className="bg-slate-900/40 hover:bg-slate-900 backdrop-blur-sm p-6 rounded-xl border border-violet-500/20 flex flex-col items-center gap-y-2 transition-all"
        >
          <p className="text-lg font-medium text-white">{BOOK_STATES.READ.es}</p>
          <p className="text-4xl font-light text-violet-200">
            {isGuest ? 1 : Read}
          </p>
        </Link>
      </div>

      <div className="w-full grid grid-cols-2 gap-4">
        <Link
          href={PAGES.HOME}
          onClick={() => changeState(BOOK_STATES.ABANDONED.es)}
          className="bg-slate-900/40 hover:bg-slate-900 backdrop-blur-sm p-6 rounded-xl border border-violet-500/20 flex flex-col items-center gap-y-2 transition-all"
        >
          <p className="text-lg font-medium text-white">{BOOK_STATES.ABANDONED.es}</p>
          <p className="text-4xl font-light text-violet-200">
            {isGuest ? 0 : Abandoned}
          </p>
        </Link>
        <Link
          href={PAGES.HOME}
          onClick={() => changeState(BOOK_STATES.HALFWAY.es)}
          className="bg-slate-900/40 hover:bg-slate-900 backdrop-blur-sm p-6 rounded-xl border border-violet-500/20 flex flex-col items-center gap-y-2 transition-all"
        >
          <p className="text-lg font-medium text-white">{BOOK_STATES.HALFWAY.es}</p>
          <p className="text-4xl font-light text-violet-200">
            {isGuest ? 0 : Halfway}
          </p>
        </Link>
      </div>
    </animated.section>
  );
}

type States = { [key: string]: number };

type BookState = (typeof BOOK_STATES)[keyof typeof BOOK_STATES]["es"];

export type { States, BookState };
