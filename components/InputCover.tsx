import Image from "next/image";
import { CLOUDINARY_URL } from "@/utils/consts";
import { coverAtom } from "@/utils/atoms";
import { Image as ImgIcon, UploadIcon } from "lucide-react";
import { notification } from "@/utils/notifications";
import { twJoin, twMerge } from "tailwind-merge";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import { useRecoilState } from "recoil";
import type { Component } from "@/utils/types";

const preset: string = String(process.env.NEXT_PUBLIC_PRESET);

export default function InputCover(props: Props): Component {
  const { isLoading, handleImage, isEditing } = props,
    [coverLoading, setCoverLoading] = useRecoilState(coverAtom),
    loading: boolean = isLoading || coverLoading,
    containerRef = useRef<HTMLDivElement>(null),
    dragCountRef = useRef<number>(0),
    [isDragging, setIsDragging] = useState<boolean>(false),
    [popupTarget, setPopupTarget] = useState<HTMLElement | null>(null),
    [errImg, setErrImg] = useState<boolean>(false),
    [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const saveImgFile = useCallback(
    async (file: File): Promise<void> => {
      setErrImg(false);
      setCoverLoading(true);

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const body: FormData = new FormData();

      try {
        body.append("file", file);
        body.append("upload_preset", preset);

        const res: Response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body,
          }),
          data: { secure_url: string } = await res.json(),
          url: string = data.secure_url;

        handleImage(url);
      } catch (err: any) {
        setErrImg(true);
        notification("error", "Error cargando portada, reinténtalo");
        console.error(`catch 'saveImgFile' ${err.message}`);
      } finally {
        setCoverLoading(false);
      }
    },
    [handleImage, setCoverLoading]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles[0]) {
        saveImgFile(acceptedFiles[0]);
      }
    },
    [saveImgFile]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noDrag: true,
    accept: { "image/*": [] },
    multiple: false,
  });

  useEffect(() => {
    const dialogEl =
      containerRef.current?.closest("dialog") ||
      containerRef.current?.closest('[role="dialog"]');

    if (!dialogEl) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[InputCover] No dialog element found for drag-and-drop scoping.");
      }
      return;
    }

    const targetEl = (dialogEl.firstElementChild as HTMLElement) || dialogEl;
    setPopupTarget(targetEl);

    function handleDragEnter(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      dragCountRef.current += 1;
      if (e.dataTransfer?.types?.includes("Files")) {
        setIsDragging(true);
      }
    }

    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      dragCountRef.current -= 1;
      if (dragCountRef.current <= 0) {
        dragCountRef.current = 0;
        setIsDragging(false);
      }
    }

    function handleDragOver(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
    }

    async function handleDrop(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        try {
          e.dataTransfer.clearData();
        } catch {
          // DataTransfer is read-only during drop events in modern browsers
        }
      }
      dragCountRef.current = 0;
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length === 0) return;

      if (files.length > 1) {
        notification("success", "Se seleccionó la primera imagen");
      }

      const file = files[0];
      if (!file.type.startsWith("image/")) {
        notification("error", "El archivo debe ser una imagen (PNG, JPG, WEBP, etc.)");
        return;
      }

      await saveImgFile(file);
    }

    async function handlePaste(e: Event) {
      const clipboardEvt = e as ClipboardEvent;
      const items = clipboardEvt.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
      if (!imageItem) return;

      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        await saveImgFile(file);
      }
    }

    dialogEl.addEventListener("dragenter", handleDragEnter);
    dialogEl.addEventListener("dragleave", handleDragLeave);
    dialogEl.addEventListener("dragover", handleDragOver);
    dialogEl.addEventListener("drop", handleDrop);
    dialogEl.addEventListener("paste", handlePaste);

    return () => {
      dialogEl.removeEventListener("dragenter", handleDragEnter);
      dialogEl.removeEventListener("dragleave", handleDragLeave);
      dialogEl.removeEventListener("dragover", handleDragOver);
      dialogEl.removeEventListener("drop", handleDrop);
      dialogEl.removeEventListener("paste", handlePaste);
      dragCountRef.current = 0;
      setIsDragging(false);
    };
  }, [saveImgFile]);

  const showImg: boolean = !errImg && Boolean(previewUrl) && !loading;

  return (
    <div ref={containerRef} className="w-full">
      <div
        {...getRootProps()}
        className={twMerge(
          "flex items-center w-full bg-slate-900/40 backdrop-blur-sm rounded-xl px-4 h-14 border-[1.5px] border-violet-500/20 border-dashed hover:border-violet-500/30 transition-colors cursor-pointer relative",
          showImg && "border-r-0",
          loading &&
            "border-violet-500/5 pointer-events-none cursor-default opacity-50"
        )}
      >
        <ImgIcon
          size={18}
          className={twJoin(
            "text-violet-300 mr-3 flex-shrink-0",
            coverLoading && "animate-spin"
          )}
        />

        <input
          {...getInputProps()}
          accept="image/*"
          multiple={false}
          name="image"
          id="image-input"
          disabled={loading}
          className="hidden disabled:opacity-50"
        />

        {errImg ? (
          <p className="text-red-300 text-lg">Error cargando portada, reinténtalo</p>
        ) : (
          <p className="text-sm sm:text-lg text-slate-300 select-none">
            {previewUrl && !coverLoading ? (
              "¡Portada lista!"
            ) : coverLoading ? (
              "Generando portada..."
            ) : (
              <>
                {isEditing ? "Cambiar portada" : "Agregar portada"}
                <span className="hidden sm:inline"> (clic, arrastrar o Ctrl+V)</span>
              </>
            )}
          </p>
        )}

        {showImg && previewUrl && (
          <div className="absolute right-0 h-full p-1 bg-violet-500/10 rounded-r-xl border-r border-violet-500/20">
            <Image
              width={30}
              height={30}
              src={previewUrl}
              alt="cover"
              className={twJoin(
                "w-8 h-full object-cover rounded-md",
                loading && "opacity-50"
              )}
            />
          </div>
        )}
      </div>

      {isDragging && popupTarget && createPortal(
        <div className="absolute inset-0 z-50 rounded-xl bg-slate-950/90 backdrop-blur-md border-2 border-dashed border-violet-400 flex flex-col items-center justify-center p-6 text-center pointer-events-none animate-in fade-in duration-200">
          <UploadIcon size={40} className="text-violet-300 mb-3 animate-bounce" />
          <p className="text-violet-100 font-semibold text-xl">
            Soltar imagen aquí
          </p>
          <p className="text-violet-300/80 text-sm mt-1">
            Para establecer como portada del libro
          </p>
        </div>,
        popupTarget
      )}
    </div>
  );
}

interface Props {
  isLoading: boolean | undefined;
  handleImage: (newUrl: string) => void;
  isEditing: boolean;
}

