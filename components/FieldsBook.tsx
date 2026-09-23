import { memo } from "react";
import InputCover from "./InputCover";
import { GENDERS } from "@/utils/consts";
import { BOOK_STATES } from "@/utils/states";
import { isEqual } from "es-toolkit";
import { tLC } from "@/utils/helpers";
import { twMerge } from "tailwind-merge";
import type { Component, InputEvent } from "@/utils/types";
import {
  UserRoundSearchIcon,
  TypeIcon,
  TagIcon,
  LibraryIcon,
  ItalicIcon,
  UserIcon,
  ChevronDownIcon,
} from "lucide-react";
import type { ChangeEventHandler } from "react";

const FieldsBook = memo(function FieldsBook(props: Props): Component {
  const {
      errorKey,
      handleChange,
      isLoading,
      setCusGenderVal,
      handleImage,
      isCustomGender,
      handleGender,
      handleState,
      isLent,
      defaultValueTitle = "",
      defaultValueAuthor = "",
      defaultValueGender = "",
      defaultValueState = "default",
      defaultValueLoaned = "",
      isEditing,
    } = props,
    applyGender: boolean = GENDERS.includes(tLC(defaultValueGender));

  return (
    <>
      <label
        htmlFor="title-input"
        className={twMerge(
          "flex items-center w-full bg-slate-900/40 backdrop-blur-sm rounded-xl px-3.5 sm:px-4 h-12 sm:h-14",
          "border border-violet-500/20 hover:border-violet-500/30 transition-colors",
          isEqual("title-input", errorKey) && "!border-red-500/50 !border-2"
        )}
      >
        <ItalicIcon size={18} className="text-violet-300 mr-3 flex-shrink-0" />
        <input
          id="title-input"
          autoFocus
          disabled={isLoading}
          onChange={handleChange}
          defaultValue={defaultValueTitle}
          name="title"
          type="text"
          className="w-full bg-transparent text-slate-200 text-sm sm:text-base md:text-lg placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          placeholder="Título"
        />
      </label>

      <label
        htmlFor="author-input"
        className={twMerge(
          "flex items-center w-full bg-slate-900/40 backdrop-blur-sm rounded-xl px-3.5 sm:px-4 h-12 sm:h-14",
          "border border-violet-500/20 hover:border-violet-500/30 transition-colors",
          isEqual("author-input", errorKey) && "!border-red-500/50 !border-2"
        )}
      >
        <UserIcon size={18} className="text-violet-300 mr-3 flex-shrink-0" />
        <input
          id="author-input"
          disabled={isLoading}
          onChange={handleChange}
          defaultValue={defaultValueAuthor}
          name="author"
          type="text"
          className="w-full bg-transparent text-slate-200 text-sm sm:text-base md:text-lg placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          placeholder="Autor"
        />
      </label>

      <div className="flex gap-x-3 w-full">
        <label
          htmlFor="gender-select"
          className={twMerge(
            "flex items-center flex-1 bg-slate-900/40 backdrop-blur-sm rounded-xl px-3.5 sm:px-4 h-12 sm:h-14 relative",
            "border border-violet-500/20 hover:border-violet-500/30 transition-colors"
          )}
        >
          <TagIcon
            size={16}
            className="text-violet-300 mr-3 absolute pointer-events-none"
          />
          <select
            id="gender-select"
            onChange={handleGender}
            disabled={isLoading}
            defaultValue={
              applyGender
                ? defaultValueGender
                : !defaultValueGender
                ? "default"
                : "custom"
            }
            className="pl-7 w-full bg-slate-900 text-slate-300 text-sm sm:text-base md:text-lg focus:outline-none disabled:opacity-50 appearance-none cursor-pointer h-full"
          >
            <option value="default" disabled>
              Género literario
            </option>
            {GENDERS.map((g: string) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            size={20}
            className="text-violet-400/70 pointer-events-none absolute right-4 sm:right-6"
          />
        </label>

        {isCustomGender && (
          <label
            htmlFor="gender-input"
            className={twMerge(
              "flex items-center flex-1 bg-slate-900/40 backdrop-blur-sm rounded-xl px-3.5 sm:px-4 h-12 sm:h-14",
              "border border-violet-500/20 hover:border-violet-500/30 transition-colors",
              isEqual("gender-input", errorKey) &&
                "!border-red-500/50 !border-2"
            )}
          >
            <TypeIcon size={18} className="text-violet-300 mr-3 flex-shrink-0" />
            <input
              id="gender-input"
              onChange={(e: InputEvent) => {
                handleChange(e);
                setCusGenderVal(e.target.value);
              }}
              name="gender"
              disabled={isLoading}
              type="text"
              className="w-full bg-transparent text-slate-200 text-sm sm:text-base md:text-lg placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              placeholder="Personalizado"
              defaultValue={applyGender ? "Mi género" : defaultValueGender}
            />
          </label>
        )}
      </div>

      <div className="flex gap-x-3 w-full">
        <label
          htmlFor="state-select"
          className={twMerge(
            "flex items-center bg-slate-900/40 backdrop-blur-sm rounded-xl px-3.5 sm:px-4 h-12 sm:h-14",
            "border border-violet-500/20 hover:border-violet-500/30 transition-colors relative",
            isLent ? "w-1/2" : "w-full"
          )}
        >
          <LibraryIcon
            size={18}
            className="text-violet-300 mr-3 absolute pointer-events-none"
          />
          <select
            id="state-select"
            disabled={isLoading}
            onChange={e => handleState(e.target.value)}
            defaultValue={defaultValueState}
            className="pl-7 w-full bg-slate-900 text-slate-300 text-sm sm:text-base md:text-lg focus:outline-none disabled:opacity-50 appearance-none cursor-pointer h-full"
          >
            <option value="default" disabled>
              Estado actual
            </option>
            {Object.values(BOOK_STATES).map(s => (
              <option key={s.en[0]} value={s.en[0]}>
                {s.es}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            size={20}
            className="text-violet-400/70 pointer-events-none absolute right-4 sm:right-6"
          />
        </label>

        {isLent && (
          <label
            htmlFor="lent-input"
            className={twMerge(
              "flex items-center w-1/2 bg-slate-900/40 backdrop-blur-sm rounded-xl px-3.5 sm:px-4 h-12 sm:h-14",
              "border border-violet-500/20 hover:border-violet-500/30 transition-colors",
              isEqual("lent-input", errorKey) && "!border-red-500/50 !border-2"
            )}
          >
            <UserRoundSearchIcon size={18} className="text-violet-300 mr-3 flex-shrink-0" />
            <input
              id="lent-input"
              disabled={isLoading}
              onChange={handleChange}
              name="loaned"
              defaultValue={defaultValueLoaned}
              type="text"
              className="w-full bg-transparent text-slate-200 text-sm sm:text-base md:text-lg placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              placeholder="Prestado a"
            />
          </label>
        )}
      </div>

      <InputCover
        isEditing={isEditing}
        isLoading={isLoading}
        handleImage={handleImage}
      />
    </>
  );
});

export default FieldsBook;

interface Props {
  errorKey: string;
  handleChange: (e: InputEvent) => void;
  isLoading?: boolean;
  setCusGenderVal: (value: string) => void;
  isCustomGender: boolean;
  handleGender: ChangeEventHandler<HTMLSelectElement>;
  handleState: (state: string) => void;
  handleImage: (newURL: string) => void;
  isLent: boolean;
  defaultValueTitle?: string;
  defaultValueAuthor?: string;
  defaultValueGender?: string;
  defaultValueState?: string;
  defaultValueLoaned?: string;
  defaultValueImg?: string;
  isEditing: boolean;
}
