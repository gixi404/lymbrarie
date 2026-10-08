import InputSearch from "@/components/InputSearch";
import ListSection from "@/components/ListSection";
import LoaderCircle from "@/components/LoaderCircle";
import SearchBanner from "@/components/banners/SearchBanner";
import TryDifferentTerms from "@/components/TryDifferentTerms";
import useLoad from "@/hooks/useLoad";
import useLocalStorage from "@/hooks/useLocalStorage";
import { animateOpacity, len, tLC } from "@/utils/helpers";
import { animated, useSpring } from "@react-spring/web";
import { PAGES } from "@/utils/consts";
import { BOOK_STATES } from "@/utils/states";
import {
  type Auth,
  getAuth,
  onAuthStateChanged,
  Unsubscribe,
} from "firebase/auth";
import { deburr, noop } from "es-toolkit";
import { FormEvent, useEffect, useState } from "react";
import { notification } from "@/utils/notifications";
import { AuthAction, type User, useUser, withUser } from "next-firebase-auth";
import type { Book, Component } from "@/utils/types";
import { useRouter, type NextRouter } from "next/router";

export default withUser({
  whenAuthed: AuthAction.RENDER,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.RENDER,
  LoaderComponent: LoaderCircle,
})(SearchPage);

function SearchPage(): Component {
  const user: User = useUser(),
    auth: Auth = getAuth(),
    router: NextRouter = useRouter(),
    [query, setQuery] = useState<string>(""),
    [queryVal, setQueryVal] = useState<string>(""),
    [booksResults, setBooksResults] = useState<Book[]>([]),
    { isLoading, startLoading, finishLoading } = useLoad(),
    [animations] = useLocalStorage("animations", true),
    [styles] = useSpring(() => animateOpacity(1, 400)),
    [stylesSec, api] = useSpring(() => animateOpacity(1, 600));

  useEffect(() => {
    if (!navigator.onLine) return;
    const unsub: Unsubscribe = onAuthStateChanged(auth, () => noop());
    return () => unsub();
  }, [auth]);

  useEffect(() => {
    if (!animations) return;
    api.start(animateOpacity(1, 600));
  }, [booksResults, queryVal]);

  useEffect(() => {
    if (Array.isArray(router.query.q)) return;
    const urlQuery: string = router.query.q ?? "";
    if (urlQuery) {
      setQueryVal(urlQuery);
      searchBooks(urlQuery);
    }
  }, [router.query.q]);

  async function searchBooks(searchQuery: string): Promise<void> {
    if (!searchQuery.trim()) return;
    startLoading();

    try {
      const ENDPOINT: string = `https://openlibrary.org/search.json?q=${searchQuery}&limit=40`,
        options: RequestInit = {
          mode: "cors",
          method: "GET",
          cache: "default",
        },
        res: Response = await fetch(ENDPOINT, options),
        data = await res.json(),
        books: Book[] = (data.docs || []).map((b: any) => ({
          id: b?.key,
          data: {
            //* Slash reemplazado porque genera error en la ruta dinámica.
            title: (b?.title ?? "").replaceAll("/", "-"),
            author: b?.author_name ? b.author_name.join(", ") : "",
            notes: "",
            gender: "Sin asignar",
            image: b?.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg` : "",
            url: `https://openlibrary.org${b?.key ?? ""}`,
            publishYear: b?.first_publish_year,
            editionCount: b?.edition_count,
            loaned: "",
            state: BOOK_STATES.PENDING.es,
            isFav: false,
            owner: user?.id,
          },
        }));

      const uniqueTitles: Set<string> = new Set<string>();
      const uniqueBooks: Book[] = books.filter((b: Book) => {
        const title: string = deburr(
          replaceInvalidChars(tLC(b.data.title ?? ""))
        );
        if (title && !uniqueTitles.has(title)) {
          uniqueTitles.add(title);
          return true;
        } else return false;
      });
      setBooksResults(uniqueBooks);
    } catch (err: any) {
      notification("error", "Error al buscar libros");
      console.error(`catch 'searchBooks' ${err.message}`);
    } finally {
      finishLoading();
    }
  }

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(
      {
        pathname: PAGES.SEARCH,
        query: { q: query },
      },
      undefined,
      { shallow: true }
    );

    setQueryVal(query);
    setQuery("");
    searchBooks(query);
  }

  return (
    <animated.section
      style={styles}
      className="relative max-w-4xl w-full px-3 sm:px-0 mb-16 lg:mb-36 text-slate-200/90 flex flex-col justify-start items-center gap-y-6 min-h-[350px]"
    >
      <SearchBanner />

      <form
        onSubmit={onSubmit}
        className="w-full flex flex-col items-center justify-center gap-y-4 px-6 sm:px-0"
      >
        <InputSearch query={query} setQuery={setQuery} isLoading={isLoading} />
      </form>

      <animated.div
        style={stylesSec}
        className="w-full flex flex-col gap-y-8 items-center justify-center"
      >
        {isLoading ? (
          <LoaderCircle
            spinnerClass="text-violet-300 w-11 h-11"
            containerClass="bg-gradient-to-br from-transparent via-transparent to-transparent h-full static pt-0"
          />
        ) : (
          len(booksResults) > 0 && (
            <div className="w-full max-w-3xl flex flex-col justify-center items-center gap-y-6">
              <ListSection myBooks={booksResults} isSearch />
            </div>
          )
        )}

        {len(booksResults) == 0 && queryVal != "" && !isLoading && (
          <TryDifferentTerms />
        )}
      </animated.div>
    </animated.section>
  );
}

function replaceInvalidChars(str: string): string {
  return str.replaceAll(/[_@\/]/g, "-");
}


