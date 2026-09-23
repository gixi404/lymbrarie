import Link from "next/link";
import useGuest from "@/hooks/useGuest";
import { ArrowLeft } from "lucide-react";
import { PAGES } from "@/utils/consts";
import type { Component } from "@/utils/types";

function BackBtn(): Component {
  const { isGuest } = useGuest();
  const targetHref = isGuest ? PAGES.GUEST : PAGES.HOME;

  return (
    <>
      {/* Mobile Back Icon */}
      <Link
        aria-label="Volver a la vista principal"
        href={targetHref}
        className="sm:hidden absolute z-20 left-4 top-4"
      >
        <ArrowLeft className="h-10 w-10 text-slate-300 hover:text-violet-400 transition-colors" />
      </Link>

      {/* Desktop Volver Button: absolute above container without pushing content */}
      <div className="hidden sm:flex w-full max-w-4xl justify-start items-center absolute -top-11 left-1/2 -translate-x-1/2 px-2 z-20">
        <Link
          href={targetHref}
          className="inline-flex items-center gap-x-2 text-slate-200 hover:text-white transition-colors text-lg font-semibold group cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6 text-slate-200 group-hover:text-white transition-colors" />
          <span>Volver</span>
        </Link>
      </div>
    </>
  );
}

export default BackBtn;
