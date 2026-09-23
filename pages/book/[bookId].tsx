import BackBtn from "@/components/btns/BackBtn";
import DEFAULT_COVER from "@/public/cover.webp";
import DeleteBookPopUp from "@/components/popups/DeleteBookPopUp";
import EditBookPopUp from "@/components/popups/EditBookPopUp";
import Head from "next/head";
import Image from "next/image";
import LoaderCircle from "@/components/LoaderCircle";
import NotesPopUp from "@/components/popups/NotesPopUp";
import OfflinePopUp from "@/components/popups/OfflinePopUp";
import SettingsBtn from "@/components/btns/SettingsBtn";
import ShareBtn from "@/components/btns/ShareBtn";
import toast from "react-hot-toast";
import useLoad from "@/hooks/useLoad";
import useLocalStorage from "@/hooks/useLocalStorage";
import usePopUp from "@/hooks/usePopUp";
import { animateOpacity, isLent, translateGender, translateState } from "@/utils/helpers";
import { AuthAction, type User, useUser, withUser } from "next-firebase-auth";
import { EMPTY_BOOK, PAGES } from "@/utils/consts";
import { dismissNoti, notification } from "@/utils/notifications";
import { isEqual, noop } from "es-toolkit";
import { popupsAtom } from "@/utils/atoms";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { animated, type AnimatedComponent, useSpring } from "@react-spring/web";
import type { Book, BookData, Component, Handler } from "@/utils/types";
import {
  type Auth,
  getAuth,
  onAuthStateChanged,
  type Unsubscribe,
} from "firebase/auth";
import {
  Trash as DeleteIcon,
  SquarePen as EditIcon,
  BookmarkCheck as FavoriteIcon,
  Library as LibraryIcon,
  Notebook as NotesIcon,
  Bookmark as RemoveFavIcon,
  Tag as StateIcon,
  User as UserIcon,
} from "lucide-react";
import { type NextRouter, useRouter } from "next/router";
import { BookAdapters } from "@/adapters/book.adapters";
import {
  decryptDataV2,
  encryptDataV2,
  getOrCreateUserKey,
} from "@/utils/userEncryption";

export default withUser({
  whenAuthed: AuthAction.RENDER,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  LoaderComponent: LoaderCircle,
})(BookId);

function BookId(): Component {
  const user: User = useUser(),
    auth: Auth = getAuth(),
    router: NextRouter = useRouter(),
    { openPopUp, closePopUp, closeBookPopUps } = usePopUp(),
    bookTitle: string = router.query.bookId?.toString() ?? "",
    title: string = decodeURIComponent(bookTitle),
    { isLoading, finishLoading } = useLoad(),
    Cover: AnimatedComponent<typeof Image> = animated(Image),
    [book, setBook] = useState<Book>(EMPTY_BOOK),
    [documentId, setDocumentId] = useState<string>(""),
    [notes, setNotes] = useState<string>(""),
    [loadingFav, setLoadingFav] = useState<boolean>(false),
    [imgSrc, setImgSrc] = useState<string>(book?.data?.image || DEFAULT_COVER.src),
    [cacheBooks, setCacheBooks] = useLocalStorage<Book[] | null>("cache-books", null),
    [allTitles] = useLocalStorage<string[]>("all-titles", []),
    myFavs: BookData[] = (cacheBooks ?? [])
      .map((b: Book) => b?.data)
      .filter((b): b is BookData => !!b?.isFav),
    checkFav: boolean = myFavs.some((b: BookData) => isEqual(b?.title, title)),
    inCache: boolean = (cacheBooks ?? []).some((b: Book) => isEqual(b?.data?.title, title)),
    notExist: boolean = !allTitles.includes(title) && !inCache && title.length > 0,
    notesProps = { updateNotes, notes, setNotes, isLoading, loadingFav, title },
    [popup] = useRecoilState(popupsAtom),
    handleRouteChange: Handler<void, void> = () => closeBookPopUps(),
    [stylesImg] = useSpring(() => animateOpacity(1, 200, 200)),
    [stylesIcons] = useSpring(() => animateOpacity(1, 1000)),
    [stylesSection] = useSpring(() => animateOpacity(1, 500));

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, []);

  useEffect(() => {
    toast.remove();
    getCacheBook();
    if (!navigator.onLine) return;
    const unsub: Unsubscribe = onAuthStateChanged(auth, () => noop());
    return () => unsub();
  }, [bookTitle, auth, user?.id]);

  useEffect(() => {
    if (!router.isReady || !title) return;
    if (notExist) router.push(PAGES.HOME);
  }, [notExist, router.isReady, title]);

  async function getCacheBook(): Promise<void> {
    const b: Book | undefined = cacheBooks?.find((b: Book) =>
      isEqual(b?.data?.title, title)
    );
    if (!b) return;
    setBook(b);
    setDocumentId(b?.id);
    setImgSrc(b?.data?.image || DEFAULT_COVER.src);

    const rawNotes = b?.data?.notes ?? "";
    if (rawNotes) {
      try {
        const userKey = user?.id ? await getOrCreateUserKey(user.id) : "";
        const decrypted = await decryptDataV2(rawNotes, userKey, user?.id as string);
        const decryptedStr =
          typeof decrypted === "string"
            ? decrypted
            : decrypted
            ? JSON.stringify(decrypted)
            : "";
        setNotes(decryptedStr);
      } catch {
        setNotes(rawNotes);
      }
    } else {
      setNotes("");
    }

    finishLoading();
  }

  async function updateNotes(): Promise<void> {
    try {
      let notesToSave = notes;
      if (user?.id && notes) {
        const userKey = await getOrCreateUserKey(user.id);
        notesToSave = encryptDataV2(notes, userKey);
      }
      const dataWithUpdatedNotes: BookData = { ...book?.data, notes: notesToSave };
      await BookAdapters.manageBook(book.id, dataWithUpdatedNotes, user.id as string);

      const updatedBook: Book = { ...book, data: { ...book?.data, notes: notesToSave } };
      const oldVersion: Book[] = (cacheBooks ?? []).filter(
        (b: Book) => b?.id != documentId
      );
      const newVersion: Book[] = [...oldVersion, updatedBook];
      setCacheBooks(newVersion);
      setBook(updatedBook);
    } catch (err: any) {
      closePopUp("notes");
      router.push(`${PAGES.ERROR}?notes=${notes}`);
      console.error(`catch 'updateNotes' ${err.message}`);
    } finally {
      dismissNoti();
    }
  }

  async function toggleFav(): Promise<void> {
    try {
      setLoadingFav(true);
      const dataWithUpdatedFav: BookData = { ...book?.data, isFav: !checkFav };
      await BookAdapters.manageBook(documentId, dataWithUpdatedFav, user.id as string);
      const oldVersion: Book[] = (cacheBooks ?? []).filter(
        (b: Book) => b?.id != documentId
      );
      const newVersion: Book[] = [
        ...oldVersion,
        { id: documentId, data: dataWithUpdatedFav },
      ];
      setCacheBooks(newVersion);
      setBook({ id: documentId, data: dataWithUpdatedFav });
      setLoadingFav(false);
      dismissNoti();
      notification(
        "success",
        !checkFav ? "Añadido a favoritos" : "Eliminado de favoritos"
      );
    } catch (err: any) {
      setLoadingFav(false);
      dismissNoti();
      notification("error", "Error al actualizar favoritos");
      console.error(`catch 'toggleFav' ${err.message}`);
    }
  }

  return (
    <animated.section
      style={stylesSection}
      className="flex flex-col justify-start items-center w-full relative"
    >
      <Head>
        <title translate="no">{book?.data?.title || "Lymbrarie"}</title>
      </Head>

      {popup.offline && <OfflinePopUp />}
      {popup.edit_book && <EditBookPopUp data={book} documentId={documentId} UID={user.id as string} />}
      {popup.notes && <NotesPopUp {...notesProps} />}
      {popup.delete_book && (
        <DeleteBookPopUp
          documentId={documentId}
          title={book?.data?.title ?? ""}
          UID={user.id as string}
          owner={book?.data?.owner ?? ""}
        />
      )}

      <BackBtn />

      <article
        id="screenshot"
        className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-sm border border-violet-500/20 
          md:rounded-2xl p-8 flex flex-col sm:flex-row gap-8 relative items-center justify-center"
      >
        <div className="flex-shrink-0">
          <div className="md:bg-violet-500/10 p-1.5 rounded-xl">
            <Cover
              priority
              style={stylesImg}
              className="select-none w-[200px] h-[300px] aspect-[2/3] rounded-lg object-cover"
              src={imgSrc}
              width={200}
              height={300}
              alt="cover"
              onError={() => setImgSrc(DEFAULT_COVER.src)}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between w-full gap-y-6">
          <div className="space-y-8">
            <p className="text-2xl sm:text-3xl font-semibold text-slate-200 break-words leading-tight">
              {book?.data?.title}
            </p>

            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-x-3">
                <div className="bg-violet-500/20 p-2 rounded-lg">
                  <UserIcon size={18} className="text-violet-300" />
                </div>
                <p className="text-base sm:text-lg">
                  {book?.data?.author || "Autor desconocido"}
                </p>
              </div>

              <div className="flex items-center gap-x-3">
                <div className="bg-violet-500/20 p-2 rounded-lg">
                  <StateIcon size={18} className="text-violet-300" />
                </div>
                <p className="text-base sm:text-lg capitalize">
                  {translateGender(book?.data?.gender ?? "")}
                </p>
              </div>

              <div id="state-cont" className="flex items-center gap-x-3">
                <div className="bg-violet-500/20 p-2 rounded-lg">
                  <LibraryIcon size={18} className="text-violet-300" />
                </div>
                <p className="text-base sm:text-lg">
                  {translateState(book?.data?.state ?? "")}
                  {isLent(translateState(book?.data?.state ?? "")) && ` ${book?.data?.loaned}`}
                </p>
              </div>
            </div>
          </div>

          <animated.div
            id="icons"
            style={stylesIcons}
            className="flex items-center gap-x-3"
          >
            <button
              onClick={() => openPopUp("notes")}
              className="btn btn-square bg-slate-700/30 sm:bg-slate-700/25 hover:bg-slate-700/50 border-2 border-slate-700/40 mb-1 mt-4 sm:mt-0"
            >
              <NotesIcon className="w-6 h-6" />
            </button>

            <div className="dropdown dropdown-top dropdown-right">
              <SettingsBtn />

              <ul
                tabIndex={0}
                className={twMerge(
                  loadingFav ? "hidden" : "block",
                  "mt-3 z-[1] shadow menu menu-sm dropdown-content rounded-xl border border-violet-500/20 w-[240px] bg-slate-800 mb-1 text-white"
                )}
              >
                <li
                  className="hover:bg-violet-500/15 transition-colors rounded-xl"
                  onClick={() =>
                    navigator.onLine ? toggleFav() : openPopUp("offline")
                  }
                >
                  <div className="flex flex-row items-center justify-start gap-x-3">
                    {checkFav ? (
                      <FavoriteIcon size={18} className="text-violet-300" />
                    ) : (
                      <RemoveFavIcon size={18} className="text-violet-300" />
                    )}
                    <p>{checkFav ? "Quitar de favoritos" : "Añadir a favoritos"}</p>
                  </div>
                </li>

                <li
                  className="my-1.5 hover:bg-violet-500/15 transition-colors rounded-xl"
                  onClick={() =>
                    navigator.onLine
                      ? openPopUp("edit_book")
                      : openPopUp("offline")
                  }
                >
                  <div className="flex flex-row items-center justify-start gap-x-3">
                    <EditIcon size={18} className="text-violet-300" />
                    <p>Editar libro</p>
                  </div>
                </li>

                <li
                  className="hover:bg-violet-500/15 transition-colors rounded-xl"
                  onClick={() =>
                    navigator.onLine
                      ? openPopUp("delete_book")
                      : openPopUp("offline")
                  }
                >
                  <div className="flex flex-row items-center justify-start gap-x-3">
                    <DeleteIcon size={18} className="text-violet-300" />
                    <p>Eliminar libro</p>
                  </div>
                </li>
              </ul>
            </div>

            <ShareBtn title={title} />
          </animated.div>
        </div>
      </article>
    </animated.section>
  );
}
