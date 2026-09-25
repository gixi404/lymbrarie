import { useRecoilState } from "recoil";
import { popupsAtom } from "@/utils/atoms";
import { MegaphoneIcon } from "lucide-react";
import type { Component } from "@/utils/types";

export default function SuggestionsBtn(): Component {
  const [popups, setPopups] = useRecoilState<any>(popupsAtom);

  return (
    <button
      type="button"
      onClick={() => setPopups({ ...popups, suggestions: true })}
      className="fixed bottom-5 left-5 md:top-5 md:bottom-auto md:left-5 z-40 flex items-center justify-center bg-slate-900/90 hover:bg-slate-800 text-violet-300 hover:text-violet-100 border border-violet-500/30 hover:border-violet-500/60 p-3 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 group hover:scale-105"
      title="Buzón de sugerencias"
      aria-label="Buzón de sugerencias"
    >
      <MegaphoneIcon className="w-5 h-5 text-violet-400 group-hover:rotate-12 transition-transform duration-300" />
    </button>
  );
}
