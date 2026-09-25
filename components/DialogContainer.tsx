import usePopUp from "@/hooks/usePopUp";
import { animated, useSpring } from "@react-spring/web";
import { animatePopup } from "@/utils/helpers";
import { noop } from "es-toolkit";
import { twMerge } from "tailwind-merge";
import type { Component, PopupIds } from "@/utils/types";
import type { MouseEventHandler } from "react";

function DialogContainer(props: Props): Component {
  const { children, divClass, id } = props,
    { closePopUp } = usePopUp(),
    close: boolean = id != "notes" && id != "edit_book",
    handleClick: Fn = () => (close ? closePopUp(id) : noop()),
    [styles] = useSpring(() => animatePopup());

  return (
    <dialog
      onClick={handleClick}
      className="w-full h-full fixed top-0 z-40 flex justify-center items-start 
        bg-slate-950/60 backdrop-blur-sm"
    >
      <animated.div
        style={styles}
        onClick={e => e.stopPropagation()}
        className={twMerge(
          "w-full sm:max-w-[600px] min-h-screen sm:min-h-0 sm:h-[500px] bg-slate-900/95 backdrop-blur-sm border border-violet-500/20 rounded-none sm:rounded-xl relative z-50 sm:mt-10 flex flex-col gap-y-3 overflow-y-auto justify-between p-6",
          divClass
        )}
      >
        {children}
      </animated.div>
    </dialog>
  );
}

export default DialogContainer;

type Fn = MouseEventHandler<HTMLDialogElement>;

interface Props {
  divClass?: string;
  children: React.ReactNode;
  id: PopupIds;
}
