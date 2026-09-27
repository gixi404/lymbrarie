import Link from "next/link";
import useGuest from "@/hooks/useGuest";
import { ArrowLeft } from "lucide-react";
import { PAGES } from "@/utils/consts";
import type { Component } from "@/utils/types";

function BackBtn(): Component {
  const { isGuest } = useGuest();
  const targetHref = isGuest ? PAGES.GUEST : PAGES.HOME;

  return (
    <div className="w-full flex justify-start items-center mb-4 sm:mb-6 z-20">
      <Link
        aria-label="Volver a la vista principal"
        href={targetHref}
        className="inline-flex items-center gap-x-2 text-slate-300 hover:text-white transition-colors text-base sm:text-lg font-semibold group cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-white transition-colors" />
        <span>Volver</span>
      </Link>
    </div>
  );
}

export default BackBtn;
