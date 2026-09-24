import { memo } from "react";
import AddBookToLibraryBtn from "./btns/AddBookToLibraryBtn";
import Cover from "@/public/cover.webp";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { BookData, Component } from "@/utils/types";

const BookCardSearched = memo(function BookCardSearched(props: Card): Component {
  const { title, image, author, notes, gender, url } = props,
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
      className="mx-4 bg-slate-900/40 backdrop-blur-sm border border-violet-500/20 transition-colors rounded-xl relative h-[200px] md:h-[220px]
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

      <div className="flex flex-col justify-between h-full w-full overflow-hidden">
        <div className="space-y-4">
          <div>
            <p
              title={title}
              onClick={() => window?.open(url, "_blank", "noopener,noreferrer")}
              className="text-xl font-medium text-slate-200 line-clamp-1 mb-2 hover:underline cursor-pointer"
            >
              {title}
            </p>
            <p className="text-[15px] text-slate-300/80">{author}</p>
          </div>

          <p
            title={notes}
            className="text-sm leading-relaxed w-full max-w-[380px] line-clamp-3 text-pretty md:line-clamp-4 text-slate-300/90 pr-2"
          >
            {notes}
          </p>
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
}
