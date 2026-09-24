import { useEffect, useState } from "react";
import { delay, isEqual } from "es-toolkit";
import useLoad from "./useLoad";
import { EMPTY_BOOK_DATA } from "@/utils/consts";
import { isLent, len, tLC } from "@/utils/helpers";
import { ERROR_DELAY_MS, MAX_TITLE_LENGTH, MAX_AUTHOR_LENGTH, MAX_FIELD_LENGTH, validateImageUrl } from "@/utils/validation";
import { ERROR_KEYS, VALIDATION_MESSAGES } from "@/utils/messages";
import { notification } from "@/utils/notifications";
import type { BookData, InputEvent, SelectEvent } from "@/utils/types";

export function useBookForm(): UseBookFormReturn {
  const { isLoading, startLoading } = useLoad();
  const [book, setBook] = useState<BookData>(EMPTY_BOOK_DATA);
  const [errorKey, setErrorKey] = useState<string>("");
  const [addClicked, setAddClicked] = useState<boolean>(false);
  const [isCustomGender, setIsCustomGender] = useState<boolean>(false);
  const [cusGenderVal, setCusGenderVal] = useState<string>("");

  useEffect(() => {
    (async function () {
      await delay(ERROR_DELAY_MS);
      setErrorKey("");
    })();
  }, [addClicked]);

  const formatTitle: string = tLC(book.title ?? "");

  function handleState(state: string): void {
    setBook((prev) => ({ ...prev, state }));
  }

  function handleChange(e: InputEvent): void {
    const key: string = e.target.name;
    const value: string = e.target.value.trim();
    setBook((prev) => ({ ...prev, [key]: value }));
  }

  function handleImage(image: string): void {
    if (!image) {
      setBook((prev) => ({ ...prev, image: "" }));
      return;
    }
    const isDataOrBlob = image.startsWith("data:") || image.startsWith("blob:");
    if (isDataOrBlob) {
      setBook((prev) => ({ ...prev, image }));
      return;
    }
    const hasCacheBuster = image.includes("t=");
    const separator = image.includes("?") ? "&" : "?";
    const finalImage = hasCacheBuster ? image : `${image}${separator}t=${Date.now()}`;
    setBook((prev) => ({ ...prev, image: finalImage }));
  }

  function handleGender(e: SelectEvent): void {
    const gender: string = e.target.value.trim();
    setIsCustomGender(isEqual(gender, "custom"));
    setBook((prev) => ({ ...prev, gender }));
  }

  function validateFields(isRepeated?: boolean): boolean {
    const maxTitleLength = len(formatTitle) > MAX_TITLE_LENGTH;
    const maxAuthorLength = len(book.author ?? "0") > MAX_AUTHOR_LENGTH;
    const emptyCustomGender = isCustomGender && !cusGenderVal;
    const maxLengthGender = isCustomGender && len(cusGenderVal) > MAX_FIELD_LENGTH;
    const emptyLoaned = isLent(book.state ?? "") && !book.loaned?.trim();
    const maxLengthLoaned = isLent(book.state ?? "") && len(book.loaned ?? "0") > MAX_FIELD_LENGTH;
    const validateImg = len(book.image ?? "0") > 0 && !validateImageUrl(book.image ?? "");

    if (!formatTitle) {
      setErrorKey(ERROR_KEYS.TITLE);
      notification("error", VALIDATION_MESSAGES.TITLE_EMPTY);
      return false;
    }
    if (isRepeated) {
      setErrorKey(ERROR_KEYS.TITLE);
      notification("error", VALIDATION_MESSAGES.TITLE_REPEATED);
      return false;
    }
    if (maxTitleLength) {
      setErrorKey(ERROR_KEYS.TITLE);
      notification("error", VALIDATION_MESSAGES.TITLE_TOO_LONG);
      return false;
    }
    if (formatTitle.includes("/")) {
      setErrorKey(ERROR_KEYS.TITLE);
      notification("error", VALIDATION_MESSAGES.TITLE_HAS_SLASH);
      return false;
    }
    if (maxAuthorLength) {
      setErrorKey(ERROR_KEYS.AUTHOR);
      notification("error", VALIDATION_MESSAGES.AUTHOR_TOO_LONG);
      return false;
    }
    if (emptyCustomGender) {
      setErrorKey(ERROR_KEYS.GENDER);
      notification("error", VALIDATION_MESSAGES.GENDER_EMPTY);
      return false;
    }
    if (maxLengthGender) {
      setErrorKey(ERROR_KEYS.GENDER);
      notification("error", VALIDATION_MESSAGES.GENDER_TOO_LONG);
      return false;
    }
    if (emptyLoaned) {
      setErrorKey(ERROR_KEYS.LOANED);
      notification("error", VALIDATION_MESSAGES.LOANED_EMPTY);
      return false;
    }
    if (maxLengthLoaned) {
      setErrorKey(ERROR_KEYS.LOANED);
      notification("error", VALIDATION_MESSAGES.LOANED_TOO_LONG);
      return false;
    }
    if (validateImg) {
      setErrorKey(ERROR_KEYS.IMAGE);
      notification("error", VALIDATION_MESSAGES.INVALID_URL);
      return false;
    }
    return true;
  }

  return {
    book, setBook,
    errorKey, setErrorKey,
    isCustomGender, setIsCustomGender,
    cusGenderVal, setCusGenderVal,
    addClicked, setAddClicked,
    formatTitle,
    isLoading, startLoading,
    handleChange, handleState, handleImage, handleGender,
    validateFields,
  };
}

interface UseBookFormReturn {
  book: BookData;
  setBook: React.Dispatch<React.SetStateAction<BookData>>;
  errorKey: string;
  setErrorKey: React.Dispatch<React.SetStateAction<string>>;
  isCustomGender: boolean;
  setIsCustomGender: React.Dispatch<React.SetStateAction<boolean>>;
  cusGenderVal: string;
  setCusGenderVal: React.Dispatch<React.SetStateAction<string>>;
  addClicked: boolean;
  setAddClicked: React.Dispatch<React.SetStateAction<boolean>>;
  formatTitle: string;
  isLoading: boolean;
  startLoading: () => void;
  handleChange: (e: InputEvent) => void;
  handleState: (state: string) => void;
  handleImage: (image: string) => void;
  handleGender: (e: SelectEvent) => void;
  validateFields: (isRepeated?: boolean) => boolean;
}
