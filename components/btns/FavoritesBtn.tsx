import useLocalStorage from "@/hooks/useLocalStorage";
import { animListAtom, showFavsAtom } from "@/utils/atoms";
import { twMerge } from "tailwind-merge";
import { useRecoilState } from "recoil";
import type { Component } from "@/utils/types";
import {
  BookmarkCheck as FavoriteCheckIcon,
  Bookmark as FavoriteIcon,
} from "lucide-react";

function FavoritesBtn({ toggleFavs }: Props): Component {
  const [showFavs] = useRecoilState<boolean>(showFavsAtom),
    [animations] = useLocalStorage("animations", true),
    [animate, setAnimate] = useRecoilState<boolean>(animListAtom);

  return (
    <button
      aria-label="Filtrar por favoritos"
      title="Favoritos"
      className={twMerge(
        showFavs ? "bg-slate-700/45" : "bg-transparent",
        "btn btn-ghost btn-square"
      )}
      onClick={() => {
        toggleFavs();
        if (animations) setAnimate(!animate);
      }}
    >
      {showFavs ? <FavoriteCheckIcon size={28} /> : <FavoriteIcon size={28} />}
    </button>
  );
}

export default FavoritesBtn;

interface Props {
  toggleFavs: () => void;
}
