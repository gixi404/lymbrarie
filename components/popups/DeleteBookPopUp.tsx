import useLoad from "@/hooks/useLoad";
import useLocalStorage from "@/hooks/useLocalStorage";
import usePopUp from "@/hooks/usePopUp";
import useTitles from "@/hooks/useTitles";
import { animated, useSpring } from "@react-spring/web";
import { animatePopup, len } from "@/utils/helpers";
import { BookAdapters } from "@/adapters/book.adapters";
import { dismissNoti, notification } from "@/utils/notifications";
import { isEqual } from "es-toolkit";
import { PAGES } from "@/utils/consts";
import { searchAtom, zeroAtom } from "@/utils/atoms";
import { TriangleAlert as WarningIcon } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { type NextRouter, useRouter } from "next/router";
import type { Book, Component } from "@/utils/types";

function DeleteBookPopUp({ documentId, title, UID, owner }: Props): Component {
  const { updateTitles } = useTitles(),
    { closePopUp } = usePopUp(),
    { push }: NextRouter = useRouter(),
    setSearchVal = useSetRecoilState<string>(searchAtom),
    setZeroBooks = useSetRecoilState<boolean>(zeroAtom),
    [cacheBooks, setCacheBooks] = useLocalStorage<Book[] | null>("cache-books", null),
    { isLoading, startLoading, finishLoading } = useLoad(),
    [styles] = useSpring(() => animatePopup());

  async function deleteDocument(): Promise<void> {
    startLoading();
    notification("loading", "Eliminando");

    try {
      await BookAdapters.deleteBook(documentId, UID, owner);
      setSearchVal("");
      setZeroBooks(isEqual(len(cacheBooks), 1));
      updateData();
      dismissNoti();
      notification("success", "Libro eliminado correctamente");
    } catch (err: any) {
      dismissNoti();
      push(PAGES.ERROR);
      console.error(`catch 'deleteDocument' ${err.message}`);
    }
  }

  function updateData(): void {
    if (len(cacheBooks) == 1) {
      setCacheBooks(null);
      updateTitles([]);
      redirectToHome();
    } else {
      const updatedBooks: Book[] = cacheBooks?.filter(
        (b: Book) => b?.data?.title != title
      ) ?? [];
      setCacheBooks(updatedBooks);
      updateTitles(updatedBooks);
      redirectToHome();
    }
  }

  function redirectToHome(): void {
    closePopUp("delete_book");
    finishLoading();
    push("/");
  }

  return (
    <dialog
      onClick={() => closePopUp("delete_book")}
      className="select-none backdrop-blur-md w-full h-full fixed top-0 z-50 flex justify-center items-start pt-10 bg-transparent px-6 sm:px-0"
    >
      <animated.div
        onClick={e => e.stopPropagation()}
        style={styles}
        className="modal-box mt-28 sm:mt-20 w-full bg-slate-900/90 rounded-2xl p-8 backdrop-blur-md border border-violet-500/20"
      >
        <div className="flex flex-row justify-start items-start gap-x-4">
          <div className="bg-violet-500/20 p-1.5 rounded-lg">
            <WarningIcon size={25} />
          </div>
          <p className="font-bold tracking-wide text-sm sm:text-lg pt-1.5 text-white">
            Advertencia
          </p>
        </div>
        <p className="py-4 text-lg sm:text-xl text-violet-100">
          ¿Deseas borrar este libro?
        </p>
        <div className="mt-6 flex flex-row flex-nowrap items-center justify-end gap-x-2 sm:gap-x-3 w-full">
          <button
            disabled={isLoading}
            type="button"
            onClick={() => closePopUp("delete_book")}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-800/80 border border-violet-500/20 hover:bg-slate-700/80 text-slate-200 text-sm sm:text-base font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Cancelar
          </button>

          {isLoading ? (
            <button
              disabled
              type="button"
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-red-900/50 border border-red-500/30 text-slate-300 text-sm sm:text-base font-medium transition-colors opacity-70 cursor-default whitespace-nowrap"
            >
              Eliminando...
            </button>
          ) : (
            <button
              onClick={deleteDocument}
              type="button"
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-red-700/90 hover:bg-red-600 border border-red-500/30 text-white text-sm sm:text-base font-medium transition-colors whitespace-nowrap"
            >
              Eliminar libro
            </button>
          )}
        </div>
      </animated.div>
    </dialog>
  );
}

export default DeleteBookPopUp;

interface Props {
  documentId: string;
  title: string;
  UID: string;
  owner: string;
}
