import AddBookToLibraryBtn from "@/components/btns/AddBookToLibraryBtn";
import BackBtn from "@/components/btns/BackBtn";
import Head from "next/head";
import Image from "next/image";
import LogInPopUp from "@/components/popups/LogInPopUp";
import NotesPopUp from "@/components/popups/NotesPopUp";
import usePopUp from "@/hooks/usePopUp";
import { animateOpacity } from "@/utils/helpers";
import { animated, AnimatedComponent, useSpring } from "@react-spring/web";
import { BOOK_RECO } from "@/utils/consts";
import { popupsAtom } from "@/utils/atoms";
import { useRecoilState } from "recoil";
import { useState } from "react";
import type { Component } from "@/utils/types";
import {
  Library as LibraryIcon,
  Notebook as NotesIcon,
  Tag as StateIcon,
  User as UserIcon,
} from "lucide-react";
import { type User, useUser, withUser } from "next-firebase-auth";

export default withUser()(BookRecommendationId);

function BookRecommendationId(): Component {
  const user: User = useUser(),
    { openPopUp } = usePopUp(),
    Cover: AnimatedComponent<typeof Image> = animated(Image),
    [notes, setNotes] = useState<string>(BOOK_RECO.notes ?? ""),
    notesProps = {
      notes,
      setNotes,
      isLoading: false,
      loadingFav: false,
      isGuest: true,
      updateNotes: () => {},
      title: "",
    },
    [popup] = useRecoilState(popupsAtom),
    [stylesImg] = useSpring(() => animateOpacity(1, 200, 200)),
    [stylesIcons] = useSpring(() => animateOpacity(1, 1000)),
    [stylesSection] = useSpring(() => animateOpacity(1, 500));

  return (
    <animated.section
      style={stylesSection}
      className="flex flex-col justify-start items-center w-full relative"
    >
      <Head>
        <title translate="no">{BOOK_RECO.title || "Lymbrarie"}</title>
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
              src={BOOK_RECO.image ?? ""}
              width={200}
              height={300}
              alt="cover"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between w-full gap-y-6">
          <div className="space-y-8">
            <p className="text-2xl sm:text-3xl font-semibold text-slate-200 line-clamp-2">
              {BOOK_RECO.title}
            </p>

            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-x-3">
                <div className="bg-violet-500/20 p-2 rounded-lg">
                  <UserIcon size={18} className="text-violet-300" />
                </div>
                <p className="text-base sm:text-lg">{BOOK_RECO.author}</p>
              </div>

              <div className="flex items-center gap-x-3">
                <div className="bg-violet-500/20 p-2 rounded-lg">
                  <StateIcon size={18} className="text-violet-300" />
                </div>
                <p className="text-base sm:text-lg capitalize">
                  {BOOK_RECO.gender}
                </p>
              </div>

              <div className="flex items-center gap-x-3">
                <div className="bg-violet-500/20 p-2 rounded-lg">
                  <LibraryIcon size={18} className="text-violet-300" />
                </div>
                <p className="text-base sm:text-lg">
                  Recomendado
                </p>
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

              <AddBookToLibraryBtn
                //  @ts-ignore-next-line
                isRecommended
                title={BOOK_RECO.title as string}
                data={{
                  ...BOOK_RECO,
                  owner: user.id,
                  state: "Pendiente",
                }}
              />
            </animated.div>
          </div>
        </div>
      </article>
    </animated.section>
  );
}
