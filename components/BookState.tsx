import { memo } from "react";
import { twMerge } from "tailwind-merge";
import { BOOK_STATES } from "@/utils/states";
import type { Component } from "@/utils/types";

function fnState(s: string, d: boolean): Component {
  return <BookStateUI state={s} showDetails={d} />;
}

function BookStateUI({ state, showDetails }: Props): Component {
  function getState(): State {
    const entry = Object.values(BOOK_STATES).find(
      s => s.es === state || s.en.some(e => e === state)
    );
    return entry
      ? { text: entry.es, bg: entry.bg }
      : { text: "", bg: "" };
  }

  const { text, bg }: State = getState();

  if (!text) return null;

  return (
    <span
      className={twMerge(
        "px-2.5 py-0.5 text-xs font-semibold rounded-md text-center select-none backdrop-blur-sm shadow-sm transition-all whitespace-nowrap",
        bg,
        showDetails ? "absolute bottom-2.5 right-2.5 z-10" : "shrink-0 min-w-[70px]"
      )}
    >
      {text}
    </span>
  );
}

const BookStateMemo = memo(BookStateUI);

export default fnState;
export { BookStateMemo };

interface Props {
  state: string;
  showDetails: boolean;
}

type State = { text: string; bg: string };