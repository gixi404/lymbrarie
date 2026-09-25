import Favicon from "@/public/favicon.ico";
import Image from "next/image";
import Link from "next/link";
import Menu from "./Menu";
import useGuest from "@/hooks/useGuest";
import { animated, useSpring } from "@react-spring/web";
import { animateOpacity, pathIs } from "@/utils/helpers";
import { menuAtom, scrollAtom } from "@/utils/atoms";
import { PAGES } from "@/utils/consts";
import { twJoin, twMerge } from "tailwind-merge";
import { useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import type { Component } from "@/utils/types";
import { LibraryIcon, UserIcon, Settings2Icon } from "lucide-react";

export default function HeaderIndex(): Component {
  const { isGuest } = useGuest(),
    [menuIsOpen, setMenuIsOpen] = useRecoilState(menuAtom),
    [styles] = useSpring(() => animateOpacity(1, 400, 600)),
    setScroll = useSetRecoilState(scrollAtom);

  useEffect(() => setMenuIsOpen(false), [location.pathname]);

  if (pathIs(PAGES.LOGIN, { exact: true })) return <></>;

  return (
    <>
      <animated.header
        style={styles}
        className="navbar max-w-[1000px] mb-8 md:mb-20 bg-slate-900/80 backdrop-blur-sm md:rounded-2xl px-6 border-b md:border border-violet-500/20 justify-between relative"
      >
        <div className="flex items-center gap-x-2 sm:gap-x-4">
          <Link
            href={isGuest ? PAGES.GUEST : PAGES.HOME}
            className="flex items-center justify-start gap-x-3 w-max hover:opacity-90 transition-opacity cursor-default"
          >
            <div className="bg-violet-500/20 p-0.5 rounded-full hidden sm:block">
            <Image
              src={Favicon.src}
              width={33}
              height={33}
              alt="logo"
              className="text-violet-400"
            />
          </div>
          <p className="text-xl font-medium bg-gradient-to-r from-violet-50 via-violet-100 to-violet-200 text-transparent bg-clip-text">
            Lymbrarie
          </p>
        </Link>
        </div>

        <nav className="hidden md:flex items-center gap-x-2">
          <Link
            href={isGuest ? PAGES.GUEST : PAGES.HOME}
            className={twMerge(
              pathIs(PAGES.HOME, { exact: true })
                ? "bg-violet-500/15 text-violet-200"
                : "text-slate-300",
              "px-4 py-2 rounded-xl transition-colors hover:bg-violet-500/15 flex items-center gap-x-2"
            )}
          >
            <LibraryIcon
              className={twJoin(
                "w-5 h-5",
                pathIs(PAGES.HOME, { exact: true }) && "text-violet-300/80"
              )}
            />
            Biblioteca
          </Link>
          {/* <Link
            onClick={() => setScroll(0)}
            href={PAGES.WRITER}
            className={twMerge(
              pathIs(PAGES.WRITER)
                ? "bg-violet-500/20 text-violet-200"
                : "text-slate-300",
              "px-4 py-2 rounded-xl transition-colors hover:bg-violet-500/20 flex items-center gap-x-2"
            )}
          >
            <PencilIcon
              className={twJoin(
                "w-5 h-5",
                pathIs(PAGES.WRITER) && "text-violet-300/80"
              )}
            />
            Escritor
          </Link> */}

          <Link
            onClick={() => setScroll(0)}
            href={PAGES.PROFILE}
            className={twMerge(
              pathIs(PAGES.PROFILE)
                ? "bg-violet-500/20 text-violet-200"
                : "text-slate-300",
              "px-4 py-2 rounded-xl transition-colors hover:bg-violet-500/20 flex items-center gap-x-2"
            )}
          >
            <UserIcon
              className={twJoin(
                "w-5 h-5",
                pathIs(PAGES.PROFILE) && "text-violet-300/80"
              )}
            />
            Perfil
          </Link>
          <Link
            onClick={() => setScroll(0)}
            href={PAGES.CONFIG}
            className={twMerge(
              pathIs(PAGES.CONFIG)
                ? "bg-violet-500/20 text-violet-200"
                : "text-slate-300",
              "px-4 py-2 rounded-xl transition-colors hover:bg-violet-500/20 flex items-center gap-x-2"
            )}
          >
            <Settings2Icon
              className={twJoin(
                "w-5 h-5",
                pathIs(PAGES.CONFIG) && "text-violet-300/80"
              )}
            />
            Configuración
          </Link>
        </nav>

        <Menu.IconBtn menuIsOpen={menuIsOpen} setMenuIsOpen={setMenuIsOpen} />
      </animated.header>
      {menuIsOpen && <Menu.Nav />}
    </>
  );
}
