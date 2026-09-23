import useLocalStorage from "@/hooks/useLocalStorage";
import { animListAtom } from "@/utils/atoms";
import { useRecoilState } from "recoil";
import type { Component, SortModes } from "@/utils/types";
import {
  Shuffle as RandomIcon,
  ArrowDownAZ as AscIcon,
  ArrowDownZA as DescIcon,
} from "lucide-react";

function SortBtn(props: Props): Component {
  const { toggleSort, ascSort } = props,
    [animations] = useLocalStorage("animations", true),
    [animate, setAnimate] = useRecoilState<boolean>(animListAtom);

  return (
    <button
      aria-label="Cambiar orden de libros"
      type="button"
      title="Ordenar"
      className="btn btn-ghost btn-square"
      onClick={() => {
        toggleSort();
        if (animations) setAnimate(!animate);
      }}
    >
      {ascSort == "asc" && <AscIcon size={29} />}
      {ascSort == "desc" && <DescIcon size={29} />}
      {ascSort == "random" && <RandomIcon size={27} />}
    </button>
  );
}

export default SortBtn;

interface Props {
  ascSort: SortModes;
  toggleSort: () => void;
}
