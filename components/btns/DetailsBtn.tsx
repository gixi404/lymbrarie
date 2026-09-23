import useLocalStorage from "@/hooks/useLocalStorage";
import { animListAtom } from "@/utils/atoms";
import { LayoutIcon, ListIcon } from "@/utils/svgs";
import type { Component } from "@/utils/types";
import type { MouseEventHandler } from "react";
import { useRecoilState } from "recoil";

function DetailsBtn({ showDetails, onClick }: Props): Component {
  const [animations] = useLocalStorage("animations", true);
  const [animate, setAnimate] = useRecoilState<boolean>(animListAtom);

  return (
    <button
      type="button"
      aria-label="Cambiar vista de detalles"
      title="Detalles"
      className="btn btn-ghost btn-square"
      onClick={e => {
        onClick(e);
        if (animations) setAnimate(!animate);
      }}
    >
      {showDetails ? <LayoutIcon /> : <ListIcon />}
    </button>
  );
}

export default DetailsBtn;

interface Props {
  showDetails: boolean;
  onClick: MouseEventHandler;
}
