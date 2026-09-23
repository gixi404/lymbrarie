import Link from "next/link";
import useGuest from "@/hooks/useGuest";
import { ArrowLeft } from "lucide-react";
import { PAGES } from "@/utils/consts";
import type { Component } from "@/utils/types";

function BackBtn(): Component {
  const { isGuest } = useGuest();
  return (
    <Link
      aria-label="Volver a la vista principal"
      href={isGuest ? PAGES.GUEST : PAGES.HOME}
      className="sm:hidden absolute z-20 left-4 top-4"
    >
      <ArrowLeft className="h-12 w-12" />
    </Link>
  );
}

export default BackBtn;
