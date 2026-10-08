import { memo } from "react";
import AddBookToLibraryBtn from "./btns/AddBookToLibraryBtn";
import Cover from "@/public/cover.webp";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { BookData, Component } from "@/utils/types";

const BookCardSearched = memo(function BookCardSearched(props: Card): Component {
  const { title, image, author, publishYear, editionCount, gender, url } = props,
    [imgSrc, setImgSrc] = useState<string>(image || Cover.src),
    data: BookData = {
      ...props,
      //* Los slice son para no exceder el tamaño máximo permitido.
      title: title.slice(0, 80),
      author: author.slice(0, 34),
      gender: gender.slice(0, 24),
    };

  useEffect(() => {
    setImgSrc(image || Cover.src);
  }, [image]);

  return (
    <li
      className="mx-4 bg-slate-900/40 backdrop-blur-sm border border-violet-500/20 transition-colors rounded-xl relative h-[180px] md:h-[200px]
    flex gap-x-6 w-full sm:w-[600px] max-w-[600px] p-6"
    >
      <div className="bg-violet-500/10 p-1.5 rounded-xl h-full">
        <Image
          src={imgSrc}
          width={120}
          height={180}
          alt="cover"
          onError={() => setImgSrc(Cover.src)}
          className="w-[120px] h-full aspect-[2/3] rounded-lg select-none object-cover"
        />
      </div>

      <div className="flex flex-col justify-between h-full w-full overflow-hidden pr-8">
        <div className="space-y-3">
          <div>
            <p
              title={title}
              onClick={() => window?.open(url, "_blank", "noopener,noreferrer")}
              className="text-xl font-medium text-slate-200 line-clamp-1 mb-1 hover:underline cursor-pointer"
            >
              {title}
            </p>
            <p className="text-[15px] text-slate-300/80 line-clamp-1">{author || "Autor desconocido"}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {publishYear && (
              <span className="bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs px-2.5 py-1 rounded-full font-medium">
                Publicado en {publishYear}
              </span>
            )}
            {!!editionCount && editionCount > 0 && (
              <span className="bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                {editionCount} {editionCount === 1 ? "edición" : "ediciones"}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* @ts-ignore-next-line */}
      <AddBookToLibraryBtn data={data} title={title} />
    </li>
  );
});

export default BookCardSearched;

interface Card {
  title: string;
  author: string;
  notes: string;
  image: string;
  gender: string;
  url: string;
  publishYear?: number | string;
  editionCount?: number;
}
