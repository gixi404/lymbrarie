import { SearchIcon } from "lucide-react";
import type { Component } from "@/utils/types";

function SearchBanner(): Component {
  return (
    <div className="hidden md:flex w-full max-w-3xl flex-col items-center justify-center gap-y-6 bg-slate-900/40 rounded-2xl p-8 backdrop-blur-sm border border-violet-500/20 h-[260px]">
      <div className="bg-violet-500/20 p-4 rounded-full relative">
        <SearchIcon size={40} className="text-violet-400" />
      </div>
      <h1 className="text-3xl lg:text-4xl font-semibold text-center bg-gradient-to-r from-violet-300 via-violet-100 to-violet-400 text-transparent bg-clip-text">
        Busca y añade libros a tu biblioteca
      </h1>
    </div>
  );
}

export default SearchBanner;
