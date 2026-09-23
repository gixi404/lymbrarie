import DialogContainer from "../DialogContainer";
import FieldsBook from "../FieldsBook";
import { useBookForm } from "@/hooks/useBookForm";
import useLocalStorage from "@/hooks/useLocalStorage";
import usePopUp from "@/hooks/usePopUp";
import useTitles from "@/hooks/useTitles";
import { BookAdapters } from "@/adapters/book.adapters";
import { coverAtom } from "@/utils/atoms";
import { dismissNoti, notification } from "@/utils/notifications";
import { PAGES } from "@/utils/consts";
import { isLent } from "@/utils/helpers";
import { useRecoilState } from "recoil";
import type { Book, BookData, Component } from "@/utils/types";
import { type NextRouter, useRouter } from "next/router";
import { useRef, type FormEvent } from "react";

function NewBookPopUp({ UID }: Props): Component {
  const { closePopUp } = usePopUp(),
    router: NextRouter = useRouter(),
    formRef = useRef<HTMLFormElement>(null),
    [cacheBooks, setCacheBooks] = useLocalStorage<Book[] | null>("cache-books", null),
    [, setShowNoti] = useLocalStorage("added", false),
    [coverLoading] = useRecoilState(coverAtom),
    {
      book,
      addClicked, setAddClicked,
      formatTitle,
      isLoading, startLoading,
      errorKey,
      isCustomGender,
      setCusGenderVal,
      handleChange, handleState, handleImage, handleGender,
      validateFields,
    } = useBookForm(),
    { isRepeated } = useTitles(formatTitle);

  async function newBook(e: FormEvent): Promise<void> {
    e.preventDefault();
    setAddClicked(!addClicked);

    if (!validateFields(isRepeated)) return;
    startLoading();
    notification("loading", "Añadiendo...");

    try {
      const id: string = crypto.randomUUID();
      const data: BookData = { ...book, owner: UID };
      await BookAdapters.manageBook(id, data, UID);
      const newVersion: Book[] = [...(cacheBooks ?? []), { id, data }];
      setCacheBooks(newVersion);
      setShowNoti(true);
      closePopUp("add_book");
    } catch (err: any) {
      router.push(PAGES.ERROR);
      console.error(`catch 'newBook' ${err.message}`);
    } finally {
      dismissNoti();
    }
  }

  return (
    <DialogContainer
      id="add_book"
      divClass="!w-full items-end !justify-start lg:justify-between"
    >
      <FieldsBook
        errorKey={errorKey}
        handleChange={handleChange}
        isLoading={isLoading}
        setCusGenderVal={setCusGenderVal}
        isCustomGender={isCustomGender}
        handleGender={handleGender}
        handleState={handleState}
        handleImage={handleImage}
        isLent={isLent(book.state ?? "")}
        isEditing={false}
      />

      <form
        onSubmit={newBook}
        ref={formRef}
        method="dialog"
        className="w-full border-violet-500/10"
      >
        <div className="flex justify-end items-center gap-x-3 mt-3">
          <button
            disabled={isLoading || coverLoading}
            type="button"
            onClick={() => closePopUp("add_book")}
            className="px-4 py-2 rounded-xl bg-slate-900/60 
            border border-violet-500/15 
            hover:bg-slate-900/80 hover:border-violet-500/30 
            transition-colors disabled:opacity-50 
            text-slate-400 hover:text-slate-300 text-lg"
          >
            Cancelar
          </button>

          <button
            disabled={isLoading || coverLoading}
            type="submit"
            className="px-8 py-2 rounded-xl
            bg-violet-500/50 border border-violet-500/20
            hover:bg-violet-500/60 hover:border-violet-500/30
            transition-colors disabled:opacity-50
            text-violet-50 text-lg font-medium"
          >
            Añadir
          </button>
        </div>
      </form>
    </DialogContainer>
  );
}

export default NewBookPopUp;

interface Props {
  UID: string;
}
