import { translateState, isLent } from "@/utils/helpers";
import type { Component, StateHistoryEntry } from "@/utils/types";
import { HistoryIcon, ClockIcon } from "lucide-react";

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

export default function BookStateHistory({ history = [] }: Props): Component {
  const sortedHistory = [...history].reverse(); // Mostrar los cambios más recientes primero

  return (
    <div className="w-full mt-6 bg-slate-900/40 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-x-3 mb-6 border-b border-violet-500/10 pb-4">
        <div className="bg-violet-500/20 p-2.5 rounded-xl text-violet-300">
          <HistoryIcon size={20} />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-200">
            Historial de estados
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Registro cronológico de cambios de estado
          </p>
        </div>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="flex items-center justify-center py-6 text-slate-400 gap-x-2 text-sm">
          <ClockIcon size={16} className="text-slate-500" />
          <span>Sin historial de cambios registrado previamente</span>
        </div>
      ) : (
        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {sortedHistory.map((entry, index) => {
            const stateLabel = translateState(entry.state);
            const formattedDate = formatDate(entry.changedAt);
            const isLast = index === sortedHistory.length - 1;

            return (
              <li key={`${entry.changedAt}-${index}`}>
                {index > 0 && <hr className="bg-violet-500/20" />}
                <div className="timeline-middle text-violet-400 my-1">
                  <div className="w-3 h-3 rounded-full bg-violet-400 ring-4 ring-violet-500/20" />
                </div>
                <div className="timeline-end timeline-box bg-slate-800/80 border-violet-500/20 text-slate-200 mb-4 p-3.5 rounded-xl w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-x-4 mb-1">
                    <span className="font-semibold text-violet-200 text-sm sm:text-base">
                      {stateLabel}
                      {isLent(entry.state) && entry.loaned && (
                        <span className="text-slate-400 font-normal text-xs sm:text-sm ml-1.5">
                          (Prestado a {entry.loaned})
                        </span>
                      )}
                    </span>
                    {index === 0 && (
                      <span className="text-[10px] sm:text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium">
                        Actual
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-slate-400 font-mono block">
                    {formattedDate}
                  </time>
                </div>
                {!isLast && <hr className="bg-violet-500/20" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
