import BackBtn from "@/components/btns/BackBtn";
import Head from "next/head";
import Image from "next/image";
import LogInPopUp from "@/components/popups/LogInPopUp";
import NotesPopUp from "@/components/popups/NotesPopUp";
import SettingsBtn from "@/components/btns/SettingsBtn";
import useLocalStorage from "@/hooks/useLocalStorage";
import usePopUp from "@/hooks/usePopUp";
import { animateOpacity } from "@/utils/helpers";
import { animated, useSpring } from "@react-spring/web";
import { GUEST_BOOKS } from "@/utils/guestBooks";
import { popupsAtom } from "@/utils/atoms";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Trash as DeleteIcon,
  SquarePen as EditIcon,
  BookmarkCheck as FavoriteIcon,
  Library as LibraryIcon,
  Notebook as NotesIcon,
  Tag as StateIcon,
  User as UserIcon,
} from "lucide-react";
import type { Component } from "@/utils/types";
import type { AnimatedComponent } from "@react-spring/web";

export default function GuestBookPage(): Component {
  const router = useRouter(),
    { id } = router.query,
    bookId = Array.isArray(id) ? id[0] : id,
    bookData = bookId ? GUEST_BOOKS[bookId] : null,
    { openPopUp } = usePopUp(),
    [animations] = useLocalStorage("animations", true),
    Cover: AnimatedComponent<typeof Image> = animated(Image),
    [notes, setNotes] = useState<string>(bookData?.notes || ""),
    notesProps = {
      notes,
      setNotes,
      isLoading: false,
      loadingFav: false,
      isGuest: true,
      updateNotes: () => {},
      title: "",
    },
    [popup] = useRecoilState<any>(popupsAtom),
    [stylesImg] = useSpring(() => animateOpacity(animations ? 1 : 0, 200, 200)),
    [stylesIcons] = useSpring(() => animateOpacity(animations ? 1 : 0, 1000)),
    [stylesSection] = useSpring(() => animateOpacity(animations ? 1 : 0, 500));

  if (!bookData) {
    return (
      <section className="flex flex-col justify-center items-center w-full h-screen">
        <p className="text-2xl text-slate-200">Book not found</p>
      </section>
    );
  }

  const displayTitle = bookData?.title || "",
    displayGender = bookData?.gender?.toLowerCase() || "",
    stateText = bookData?.state || "";

  return (
    <animated.section
      style={stylesSection}
      className="flex flex-col justify-start items-center w-full relative"
    >
      <Head>
        <title translate="no">{displayTitle}</title>
      </Head>

      {popup.login && <LogInPopUp />}
      {popup.notes && <NotesPopUp {...notesProps} />}

      <BackBtn />

      <article
        id="screenshot"
        className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-sm border border-violet-500/20
          md:rounded-2xl p-8 flex flex-col sm:flex-row gap-8 relative items-center justify-center"
      >
        <div className="flex-shrink-0">
          <div className="md:bg-violet-500/10 p-1.5 rounded-xl">
            <Cover
              style={stylesImg}
              className="select-none w-[200px] h-[300px] aspect-[2/3] rounded-lg object-cover"
              src={bookData?.image || ""}
              width={200}
              height={300}
              alt="cover"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between w-full gap-y-6">
          <div className="space-y-8">
            <p className="text-2xl sm:text-3xl font-semibold text-slate-200 line-clamp-2">
              {displayTitle}
            </p>

            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-x-3">
                <div className="bg-violet-500/20 p-2 rounded-lg">
                  <UserIcon size={18} className="text-violet-300" />
                </div>
                <p className="text-base sm:text-lg">{bookData?.author}</p>
              </div>

              <div className="flex items-center gap-x-3">
                <div className="bg-violet-500/20 p-2 rounded-lg">
                  <StateIcon size={18} className="text-violet-300" />
                </div>
                <p className="text-base sm:text-lg capitalize">{displayGender}</p>
              </div>

              <div className="flex items-center gap-x-3">
                <div className="bg-violet-500/20 p-2 rounded-lg">
                  <LibraryIcon size={18} className="text-violet-300" />
                </div>
                <p className="text-base sm:text-lg">{stateText}</p>
              </div>
            </div>

            <animated.div
              id="icons"
              style={stylesIcons}
              className="flex items-center gap-x-3"
            >
              <button
                onClick={() => openPopUp("notes")}
                className="btn btn-square bg-slate-700/30 sm:bg-slate-700/25 hover:bg-slate-700/50 border-2 border-slate-700/40 mb-1 mt-4 sm:mt-0"
              >
                <NotesIcon className="w-6 h-6" />
              </button>

              <div className="dropdown dropdown-top dropdown-right">
                <SettingsBtn />
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] shadow menu menu-sm dropdown-content rounded-xl border border-violet-500/20 w-[240px] bg-slate-800 mb-1 text-white"
                >
                  <li
                    className="hover:bg-violet-500/15 transition-colors rounded-xl"
                    onClick={() => openPopUp("login")}
                  >
                    <div className="flex flex-row items-center justify-start gap-x-3">
                      <FavoriteIcon size={18} className="text-violet-300" />
                      <p>Añadir a favoritos</p>
                    </div>
                  </li>

                  <li
                    className="my-1.5 hover:bg-violet-500/15 transition-colors rounded-xl"
                    onClick={() => openPopUp("login")}
                  >
                    <div className="flex flex-row items-center justify-start gap-x-3">
                      <EditIcon size={18} className="text-violet-300" />
                      <p>Editar libro</p>
                    </div>
                  </li>

                  <li
                    className="hover:bg-violet-500/15 transition-colors rounded-xl"
                    onClick={() => openPopUp("login")}
                  >
                    <div className="flex flex-row items-center justify-start gap-x-3">
                      <DeleteIcon size={18} className="text-violet-300" />
                      <p>Eliminar libro</p>
                    </div>
                  </li>
                </ul>
              </div>
            </animated.div>
          </div>
        </div>
      </article>
    </animated.section>
  );
}
