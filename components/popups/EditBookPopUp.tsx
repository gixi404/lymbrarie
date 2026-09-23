import DialogContainer from "../DialogContainer";
import FieldsBook from "../FieldsBook";
import { useBookForm } from "@/hooks/useBookForm";
import useLocalStorage from "@/hooks/useLocalStorage";
import usePopUp from "@/hooks/usePopUp";
import { BookAdapters } from "@/adapters/book.adapters";
import { deburr, isEqual } from "es-toolkit";
import { dismissNoti, notification } from "@/utils/notifications";
import { GENDERS, PAGES } from "@/utils/consts";
import { tLC, isLent } from "@/utils/helpers";
import { scrollAtom } from "@/utils/atoms";
import { useRecoilState } from "recoil";
import type { Book, BookData, Component } from "@/utils/types";
import { type NextRouter, useRouter } from "next/router";
import { useEffect, useRef, useState, type FormEvent } from "react";

function EditBookPopUp(props: Props): Component {
  const { data: dataBook, documentId, UID } = props,
    data: BookData = dataBook?.data,
    { closePopUp } = usePopUp(),
    router: NextRouter = useRouter(),
    bookId: string = router.query.bookId as string,
    formatBookId: string = decodeURIComponent(bookId),
    form = useRef<HTMLFormElement>(null),
    [cacheBooks, setCacheBooks] = useLocalStorage<Book[] | null>("cache-books", null),
    [allTitles, setAllTitles] = useLocalStorage<string[]>("all-titles", []),
    [, setScrollLS] = useLocalStorage("scroll-editpopup", 0),
    [scroll] = useRecoilState(scrollAtom),
    [editDisabled, setEditDisabled] = useState<boolean>(true),
    {
      book, setBook,
      isLoading, startLoading,
      errorKey,
      isCustomGender, setIsCustomGender,
      setCusGenderVal,
      addClicked, setAddClicked,
      handleChange, handleState, handleImage, handleGender,
      validateFields,
    } = useBookForm();

  useEffect(() => loadBookData(), [data]);

  useEffect(() => {
    const noChanges: boolean =
      isEqual(book.title, data?.title) &&
      isEqual(book.gender, data?.gender) &&
      isEqual(book.state, data?.state) &&
      isEqual(book.image, data?.image) &&
      isEqual(book.author, data?.author) &&
      isEqual(book.loaned, data?.loaned);

    if (noChanges) setEditDisabled(true);
    else setEditDisabled(false);
  }, [book, data]);

  function loadBookData(): void {
    const loadData: BookData = {
      title: data?.title,
      author: data?.author,
      state: data?.state,
      image: data?.image,
      gender: data?.gender,
      owner: data?.owner,
      loaned: data?.loaned,
      notes: data?.notes ?? "",
      isFav: data?.isFav ?? false,
    };
    setBook(loadData);
    setIsCustomGender(!GENDERS.includes(tLC(data?.gender ?? "")));
    setCusGenderVal(data?.gender ?? "");
  }

  async function editBook(e: FormEvent): Promise<void> {
    e.preventDefault();
    setAddClicked(!addClicked);

    const title: string = tLC(book.title ?? ""),
      repeteadTitle: boolean = allTitles.some(
        (t: string) =>
          deburr(tLC(t)) != deburr(tLC(formatBookId)) &&
          isEqual(deburr(tLC(t)), deburr(tLC(title)))
      );

    if (!validateFields(repeteadTitle)) return;
    startLoading();
    notification("loading", "Editando...");

    const loaned: string = isLent(book.state ?? "") ? (book.loaned ?? "") : "",
      updatedData: BookData = { ...book, loaned },
      newVersion: Book[] = (cacheBooks ?? []).map((b: Book) =>
        b.id === documentId ? { id: documentId, data: updatedData } : b
      ),
      titlePage: string = encodeURIComponent(book.title ?? ""),
      newPath: string = `${PAGES.BOOK}/${titlePage}`,
      newTitles: string[] = [...allTitles, book.title ?? ""];

    try {
      await BookAdapters.manageBook(documentId, updatedData, UID);
      setCacheBooks(newVersion);
      setAllTitles(newTitles);
      setScrollLS(scroll);
      closePopUp("edit_book");
      if (router.pathname.includes(PAGES.BOOK) && formatBookId !== book.title) {
        await router.push(newPath);
      }
    } catch (err: any) {
      router.push(PAGES.ERROR);
      console.error(`catch 'editBook' ${err.message}`);
    } finally {
      dismissNoti();
    }
  }

  return (
    <DialogContainer
      id="edit_book"
      divClass="!justify-start lg:justify-between"
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
        defaultValueTitle={data?.title}
        defaultValueAuthor={data?.author}
        defaultValueGender={data?.gender}
        defaultValueState={data?.state}
        defaultValueLoaned={data?.loaned}
        defaultValueImg={data?.image}
        isEditing
      />

      <form
        onSubmit={editBook}
        ref={form}
        method="dialog"
        className="flex justify-end items-center font-public max-w-full gap-x-2"
      >
        <button
          disabled={isLoading}
          type="button"
          onClick={() => closePopUp("edit_book")}
          className="px-4 py-2 rounded-xl bg-slate-900/60 
            border border-violet-500/15 
            hover:bg-slate-900/80 hover:border-violet-500/30 
            transition-colors disabled:opacity-50 
            text-slate-400 text-lg"
        >
          Cancelar
        </button>
        <button
          disabled={editDisabled || isLoading}
          type="submit"
          className="px-8 py-2 rounded-xl
            bg-violet-500/20 border border-violet-500/20
            hover:bg-violet-500/30 hover:border-violet-500/30
            transition-colors disabled:opacity-50 disabled:hover:bg-violet-500/20
            text-violet-50 text-lg font-medium"
        >
          Editar
        </button>
      </form>
    </DialogContainer>
  );
}

export default EditBookPopUp;

interface Props {
  data: Book;
  documentId: string;
  UID: string;
}
