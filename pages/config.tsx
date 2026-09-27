import ConfigOption from "@/components/ConfigOption";
import LoaderCircle from "@/components/LoaderCircle";
import useGuest from "@/hooks/useGuest";
import useLocalStorage from "@/hooks/useLocalStorage";
import { animateOpacity, clearStorage, len } from "@/utils/helpers";
import { animated, useSpring } from "@react-spring/web";
import { AuthAction, useUser, withUser, type User } from "next-firebase-auth";
import { PAGES } from "@/utils/consts";
import { type Auth, getAuth } from "firebase/auth";
import { type NextRouter, useRouter } from "next/router";
import type { Book, Component } from "@/utils/types";
import type { ChangeEvent } from "react";
import { BookAdapters } from "@/adapters/book.adapters";
import { dismissNoti, notification } from "@/utils/notifications";
import {
  TypeIcon,
  CircleIcon,
  LibraryIcon,
  LogOutIcon,
  SparklesIcon,
  Download as DownloadIcon,
} from "lucide-react";

export default withUser({
  whenAuthed: AuthAction.RENDER,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.RENDER,
  LoaderComponent: LoaderCircle,
})(ConfigPage);

function ConfigPage(): Component {
  const auth: Auth = getAuth(),
    user: User = useUser(),
    { push }: NextRouter = useRouter(),
    [animations, setAnimations] = useLocalStorage("animations", true),
    [state, setState] = useLocalStorage("state", true),
    [recommendations, setRecom] = useLocalStorage("recommendations", true),
    [circles, setCircles] = useLocalStorage("circles", true),
    [lang, setLang] = useLocalStorage("language", true),
    [cacheBooks] = useLocalStorage<Book[] | null>("cache-books", null),
    { isGuest } = useGuest(),
    [username, setUsername] = useLocalStorage("username", ""),
    [styles] = useSpring(() => animateOpacity(1, 400));

  function handleUsername(e: ChangeEvent<HTMLInputElement>): void {
    if (len(username) > 38) return;
    else setUsername(e.target.value);
  }

  async function exportBooksJSON(): Promise<void> {
    let booksToExport: Book[] = cacheBooks ?? [];

    if ((!booksToExport || booksToExport.length === 0) && user?.id && navigator.onLine) {
      try {
        notification("loading", "Obteniendo datos de libros...");
        const res = await BookAdapters.getBooks(user.id);
        dismissNoti();
        if (res.books && res.books.length > 0) {
          booksToExport = res.books;
        }
      } catch (err) {
        dismissNoti();
        console.error("Error fetching books for export:", err);
      }
    }

    if (!booksToExport || booksToExport.length === 0) {
      notification("error", "No hay libros para exportar");
      return;
    }

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(booksToExport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().split("T")[0];
    downloadAnchor.setAttribute("download", `lymbrarie_books_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notification("success", "Datos exportados correctamente");
  }

  function forgetSession(): void {
    clearStorage();
    setRecom(recommendations);
    setCircles(circles);
    setLang(lang);
    setAnimations(animations);
    setState(state);
    auth.signOut();
    push(PAGES.LOGIN);
  }

  return (
    <animated.section
      style={styles}
      className="relative max-w-4xl w-full mb-16 lg:mb-36 text-slate-200/90 flex flex-col justify-start items-center gap-y-12"
    >
      <div className="w-full space-y-4 bg-slate-900/40 backdrop-blur-sm p-8 md:rounded-2xl md:border border-violet-500/20">
        <ConfigOption
          isInput
          inputVal={username}
          handleChange={handleUsername}
          Icon={TypeIcon}
          label="Nombre de usuario"
        />

        <ConfigOption
          label="Mostrar estado del libro en la lista"
          textBtn={state ? "Activado" : "Desactivado"}
          Icon={LibraryIcon}
          action={() => setState(!state)}
        />

        <ConfigOption
          label="Animaciones"
          textBtn={animations ? "Activado" : "Desactivado"}
          Icon={SparklesIcon}
          action={() => setAnimations(!animations)}
        />

        <ConfigOption
          label="Círculos violetas de fondo"
          textBtn={circles ? "Activado" : "Desactivado"}
          Icon={CircleIcon}
          action={() => setCircles(!circles)}
        />

        <ConfigOption
          label="Exportar datos de libros"
          textBtn="Exportar (JSON)"
          Icon={DownloadIcon}
          noReload
          action={exportBooksJSON}
        />
      </div>

      {!isGuest && (
        <button
          type="button"
          onClick={forgetSession}
          className="mt-4 px-6 py-3 flex justify-center items-center gap-x-3 rounded-xl border-2 border-red-300/70 hover:border-red-400/80 hover:text-red-400  transition-colors text-red-300 text-lg"
        >
          <LogOutIcon size={24} />
          <span>Cerrar Sesión</span>
        </button>
      )}
    </animated.section>
  );
}
