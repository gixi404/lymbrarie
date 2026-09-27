const BOOK_STATES = {
  READING: { es: "Leyendo", en: ["Reading"], bg: "bg-amber-950/30 text-amber-500/60 border border-amber-500/60" },
  READ: { es: "Leído", en: ["Read"], bg: "bg-emerald-950/30 text-emerald-500/60 border border-emerald-500/60" },
  PENDING: { es: "Pendiente", en: ["Pending"], bg: "bg-sky-950/30 text-sky-500/60 border border-sky-500/60" },
  LENT: { es: "Prestado", en: ["Lent", "Loaned"], bg: "bg-indigo-950/30 text-indigo-500/60 border border-indigo-500/60" },
  RECOMMENDED: { es: "Recomendado", en: ["Recommended"], bg: "bg-purple-950/30 text-purple-500/60 border border-purple-500/60" },
  ABANDONED: { es: "Abandonado", en: ["Abandoned"], bg: "bg-rose-950/30 text-rose-500/60 border border-rose-500/60" },
  HALFWAY: { es: "A medias", en: ["Halfway", "Half"], bg: "bg-orange-950/30 text-orange-500/60 border border-orange-500/60" },
} as const;



function translateState(state: string): string {
  const entry = Object.values(BOOK_STATES).find(
    s => s.en.some(e => e === state) || s.es === state
  );
  return entry?.es ?? state;
}

function mapStateToEnglish(state: string): string[] {
  const entry = Object.values(BOOK_STATES).find(
    s => s.es === state
  );
  return entry ? [...entry.en] : [state];
}

function isLent(state: string): boolean {
  return BOOK_STATES.LENT.en.some(e => e === state) || state === BOOK_STATES.LENT.es;
}

export {
  BOOK_STATES,

  translateState,
  mapStateToEnglish,
  isLent,
};
