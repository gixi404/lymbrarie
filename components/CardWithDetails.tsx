import { memo } from "react";
import Cover from "@/public/cover.webp";
import Image from "next/image";
import useLocalStorage from "@/hooks/useLocalStorage";
import { translateGender } from "@/utils/helpers";
import { useEffect, useState } from "react";
import type { Component } from "@/utils/types";
import { Tag as GenderIcon, User as UserIcon } from "lucide-react";

const CardWithDetails = memo(function CardWithDetails(props: Card): Component {
  const [state] = useLocalStorage("state", true),
    { title, formatState, img, gender, author, onClick } = props,
    [imgSrc, setImgSrc] = useState<string>(img || Cover.src),
    translatedGender = translateGender(gender || "");

  useEffect(() => {
    setImgSrc(img || Cover.src);
  }, [img]);

  return (
    <li
      onClick={onClick}
      className="mx-2 sm:mx-4 bg-slate-900/40 backdrop-blur-sm border border-l-0 border-violet-500/20 hover:border-violet-500/30 rounded-xl relative h-[130px] flex gap-x-2 sm:gap-x-5 w-full sm:w-[600px] max-w-[600px] cursor-pointer hover:scale-[0.98] duration-300"
    >
      {state && formatState()}
      {img && (
        <div className="bg-violet-500/10 p-1 sm:p-1.5 rounded-l-xl h-full w-[85px] min-w-[85px] sm:w-[85px] sm:min-w-[85px]">
          <Image
            loading="lazy"
            src={imgSrc}
            width={85}
            height={118}
            alt="cover"
            onError={() => setImgSrc(Cover.src)}
            className="rounded-lg select-none object-cover h-full w-full"
          />
        </div>
      )}
      <div className="flex flex-col justify-between items-start gap-y-1 h-full flex-1 min-w-0 py-2 pr-2 sm:pr-3">
        <div className="flex flex-row justify-start items-center gap-x-1 sm:gap-x-2 w-full">
          <p
            title={title}
            className="text-slate-200/90 text-sm sm:text-xl font-light overflow-hidden overflow-ellipsis whitespace-nowrap max-w-full"
          >
            {title}
          </p>
        </div>
        <div className="sm:pl-1 w-full space-y-1 sm:space-y-2 text-slate-300/80">
          {author && (
            <div className="flex flex-row justify-start items-center gap-x-2">
              <div className="bg-violet-500/20 p-[5.3px] rounded-lg">
                <UserIcon size={14} className="text-violet-400" />
              </div>
              <p className="text-sm sm:text-base capitalize line-clamp-1">
                {author}
              </p>
            </div>
          )}
          {gender && gender != "no-gender" && gender != "Sin asignar" && (
            <div className="flex flex-row justify-start items-start gap-x-2">
              <div className="bg-violet-500/20 p-[5.3px] rounded-lg">
                <GenderIcon size={14} className="text-violet-400" />
              </div>
              <p className="text-sm sm:text-base capitalize line-clamp-1">
                {translatedGender}
              </p>
            </div>
          )}
        </div>
      </div>
    </li>
  );
});

export default CardWithDetails;

interface Card {
  title: string;
  formatState: () => Component;
  onClick: () => Promise<boolean>;
  img?: string;
  gender?: string;
  author?: string;
}
