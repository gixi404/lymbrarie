import DialogContainer from "../DialogContainer";
import usePopUp from "@/hooks/usePopUp";
import { X as XIcon, Clock as ClockIcon } from "lucide-react";
import { translateState, isLent } from "@/utils/helpers";
import type { Component, StateHistoryEntry } from "@/utils/types";
import { twMerge } from "tailwind-merge";

interface Props {
  history?: StateHistoryEntry[];
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export default function HistoryPopUp({ history = [] }: Props): Component {
  const { closePopUp } = usePopUp();
  const sortedHistory = [...history].reverse(); // Mostrar los cambios más recientes primero

  return (
    <DialogContainer
      id="history"
      divClass="items-start max-w-md w-full justify-start min-h-0 h-auto my-auto sm:my-0 sm:mt-12 rounded-2xl p-6 relative bg-slate-900 border border-violet-500/20 shadow-2xl"
    >
      <button
        type="button"
        onClick={() => closePopUp("history")}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer z-10"
        aria-label="Cerrar"
      >
        <XIcon size={20} />
      </button>

      <h3 className="text-base font-semibold text-slate-200 mb-4 select-none">
        Historial de cambios
      </h3>

      <div className="w-full max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
        {sortedHistory.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-slate-400 gap-x-2 text-xs">
            <ClockIcon size={16} className="text-slate-500" />
            <span>Sin cambios registrados</span>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4 relative pl-1">
            {sortedHistory.map((entry, index) => {
              const rawTranslated = translateState(entry.state);
              const READING_STATES = [
                "Leyendo",
                "Leído",
                "Pendiente",
                "Prestado",
                "Recomendado",
                "Abandonado",
                "A medias",
              ];
              const isReadingState = READING_STATES.includes(rawTranslated);

              const formattedLabel = isReadingState
                ? `Estado modificado a ${rawTranslated}${
                    isLent(entry.state) && entry.loaned ? ` (${entry.loaned})` : ""
                  }`
                : rawTranslated;

              const formattedDate = formatDate(entry.changedAt);
              const isLast = index === sortedHistory.length - 1;

              return (
                <div
                  key={`${entry.changedAt}-${index}`}
                  className={twMerge(
                    "flex items-center gap-x-3 relative pb-4 min-w-0",
                    !isLast && "border-b border-slate-800/80"
                  )}
                >
                  <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-violet-400/90 ring-4 ring-violet-500/10" />

                  <div className="flex items-center justify-between w-full gap-x-3 min-w-0">
                    <span
                      className="text-sm font-medium text-slate-200 truncate min-w-0 flex-1"
                      title={formattedLabel}
                    >
                      {formattedLabel}
                    </span>

                    <time className="text-xs text-slate-400 font-mono flex-shrink-0 whitespace-nowrap">
                      {formattedDate}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DialogContainer>
  );
}

