import useLoad from "@/hooks/useLoad";
import useLocalStorage from "@/hooks/useLocalStorage";
import usePopUp from "@/hooks/usePopUp";
import useTitles from "@/hooks/useTitles";
import { animated, useSpring } from "@react-spring/web";
import { animateOpacity, isLent } from "@/utils/helpers";
import { BookAdapters } from "@/adapters/book.adapters";
import { CheckIcon, PlusIcon } from "lucide-react";
import { isNull, noop } from "es-toolkit";
import { notification } from "@/utils/notifications";
import { PAGES } from "@/utils/consts";
import { twJoin, twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import { type NextRouter, useRouter } from "next/router";
import { type User, useUser, withUser } from "next-firebase-auth";
import type { Book, BookData, Component, StateHistoryEntry } from "@/utils/types";

export default withUser()(AddBookToLibraryBtn);

function AddBookToLibraryBtn(props: Props | any): Component {
  const { id: UID }: User = useUser(),
    { data, title, isRecommended } = props,
    [userId, setUserId] = useState<string | null>(UID),
    router: NextRouter = useRouter(),
    { openPopUp } = usePopUp(),
    [animations] = useLocalStorage("animations", true),
    [styles, api] = useSpring(() => animateOpacity(1, 300)),
    [isPressed, setIsPressed] = useState<boolean>(false),
    { isRepeated } = useTitles(title),
    inLibrary: boolean = isRepeated || isPressed,
    [cacheBooks, setCacheBooks] = useLocalStorage<Book[] | null>("cache-books", null),
    { startLoading, isLoading, finishLoading } = useLoad();

  useEffect(() => setUserId(UID), [UID]);

  useEffect(() => {
    if (!animations) return;
    api.start(animateOpacity(1, 300));
  }, [isLoading]);

  async function addBookToLibrary(): Promise<void> {
    startLoading();
    try {
      const id: string = crypto.randomUUID();
      const initialState = data.state || "Pending";
      const initialHistory: StateHistoryEntry[] = [
        {
          state: initialState,
          changedAt: new Date().toISOString(),
          ...(isLent(initialState) && data.loaned ? { loaned: data.loaned } : {}),
        },
      ];
      const bookData: BookData = {
        ...data,
        owner: UID ?? "",
        stateHistory: initialHistory,
      };
      const newVersion: Book[] = [...(cacheBooks ?? []), { id, data: bookData }];
      await BookAdapters.manageBook(id, bookData, UID ?? "");
      setIsPressed(true);
      setCacheBooks(newVersion);
      if (isRecommended) return redirectToBook();
    } catch (err: any) {
      notification("error", "Error al añadir el libro");
      console.error(`catch 'addBookToLibrary' ${err.message}`);
    } finally {
      finishLoading();
    }
  }

  function handleClick(): void {
    switch (true) {
      case isNull(userId):
        openPopUp("login");
        break;

      case inLibrary:
        redirectToBook();
        break;

      default:
        addBookToLibrary();
        break;
    }
  }

  function redirectToBook(): void {
    router.push(`${PAGES.BOOK}/${encodeURIComponent(title)}`);
  }

  return (
    <animated.div
      style={styles}
      onClick={e => {
        if (isRecommended) {
          e.stopPropagation();
          handleClick();
        } else noop();
      }}
      className={twMerge(
        isRecommended
          ? "btn btn-square bg-slate-700/30 sm:bg-slate-700/25 hover:bg-slate-700/50 border-2 border-slate-700/40 mb-1 mt-4 sm:mt-0"
          : "flex justify-end absolute bottom-6 right-6"
      )}
    >
      {isLoading ? (
        <div
          className={twMerge(
            isRecommended
              ? "pt-1"
              : "h-10 w-10 hover:bg-violet-500/30 border-violet-500/20 hover:border-violet-500/30 p-2 rounded-xl bg-violet-500/20 border transition-colors backdrop-blur-sm text-violet-200"
          )}
        >
          <span className="loading loading-spinner" />
        </div>
      ) : (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            handleClick();
          }}
          className={twMerge(
            !isRecommended &&
              twMerge(
                inLibrary
                  ? "border-green-300 hover:bg-violet-500/30 border--500/20 hover:border-green-300/20 cursor-pointer"
                  : "hover:bg-violet-500/30 border-violet-500/20 hover:border-violet-500/30",
                "h-10 w-10 p-2 rounded-xl bg-violet-900 md:bg-violet-500/20 border transition-colors md:backdrop-blur-sm"
              )
          )}
        >
          {inLibrary ? (
            <CheckIcon className="w-6 h-6 text-green-300" />
          ) : (
            <PlusIcon
              className={twJoin("w-6 h-6", !isRecommended && "text-violet-300")}
            />
          )}
        </button>
      )}
    </animated.div>
  );
}

interface Props {
  data: BookData;
  title: string;
  isRecommended?: boolean;
}
