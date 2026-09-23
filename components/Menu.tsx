import { memo } from "react";
import Link from "next/link";
import { CroissantIcon, MenuIcon } from "lucide-react";
import { PAGES } from "@/utils/consts";
import { pathIs } from "@/utils/helpers";
import type { Component } from "@/utils/types";

const Nav = memo(function Nav(): Component {
  return (
    <nav className="absolute top-20 z-50 w-[200px] right-6 bg-slate-900/95 backdrop-blur-md gap-y-3 p-4 rounded-xl flex-col items-start justify-center border border-violet-500/20 flex md:hidden shadow-2xl">
      <Link
        className={
          pathIs(PAGES.HOME, { exact: true })
            ? "text-violet-300/95"
            : "text-slate-200"
        }
        href={PAGES.HOME}
      >
        &gt;&nbsp;&nbsp;Biblioteca
      </Link>
      <Link
        className={
          pathIs(PAGES.PROFILE) ? "text-violet-300/95" : "text-slate-200"
        }
        href={PAGES.PROFILE}
      >
        &gt;&nbsp;&nbsp;Perfil
      </Link>
      <Link
        className={
          pathIs(PAGES.CONFIG) ? "text-violet-300/95" : "text-slate-200"
        }
        href={PAGES.CONFIG}
      >
        &gt;&nbsp;&nbsp;Configuración
      </Link>
    </nav>
  );
});

const IconBtn = memo(function IconBtn({ menuIsOpen, setMenuIsOpen }: PropsBtn): Component {
  return (
    <button
      type="button"
      className="md:hidden text-violet-300 text-2xl"
      onClick={() => setMenuIsOpen(!menuIsOpen)}
    >
      {menuIsOpen ? (
        <CroissantIcon className="text-violet-100" size={24} />
      ) : (
        <MenuIcon className="text-violet-200" size={24} />
      )}
    </button>
  );
});

const Menu = {
  Nav,
  IconBtn,
};

export default Menu;

interface PropsBtn {
  menuIsOpen: boolean;
  setMenuIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
