import html2canvas from "html2canvas-pro";
import { Share2 as Icon } from "lucide-react";
import type { Component } from "@/utils/types";

interface Props {
  title: string;
  onShare?: () => void;
}

function ShareBtn({ title, onShare }: Props): Component {
  return (
    <button
      type="button"
      onClick={() => {
        handleShare(title);
        onShare?.();
      }}
      className="btn btn-square bg-slate-700/30 sm:bg-slate-700/25 hover:bg-slate-700/50 border-2 border-slate-700/40 mb-1 mt-4 sm:mt-0 hidden sm:flex justify-center items-center"
    >
      <Icon className="w-5 h-5 sm:w-[26px] sm:h-[26px]" />
    </button>
  );
}

export default ShareBtn;

function handleShare(title: string): void {
  const content = document.getElementById("screenshot");
  if (!(content instanceof HTMLElement)) return;

  const contentClone = content.cloneNode(true);
  if (!(contentClone instanceof HTMLElement)) return;

  const iconsClone = contentClone.querySelector("#icons"),
    watermark = document.createElement("div"),
    link = document.createElement("a");

  contentClone.style.width = "640px";
  contentClone.style.maxWidth = "640px";
  contentClone.style.boxSizing = "border-box";
  contentClone.style.position = "fixed";
  contentClone.style.left = "-9999px";
  contentClone.style.top = "0px";
  contentClone.style.padding = "32px";
  contentClone.style.display = "flex";
  contentClone.style.flexDirection = "row";
  contentClone.style.alignItems = "center";
  contentClone.style.gap = "2rem";
  contentClone.style.backgroundColor = "rgb(15, 23, 42)";
  contentClone.style.border = "2px solid rgba(139, 92, 246, 0.3)";
  contentClone.style.borderRadius = "16px";

  if (iconsClone instanceof HTMLElement) iconsClone.style.display = "none";

  watermark.textContent = "lymbrarie.vercel.app";
  watermark.style.position = "absolute";
  watermark.style.bottom = "12px";
  watermark.style.right = "16px";
  watermark.style.fontSize = "14px";
  watermark.style.color = "rgba(255, 255, 255, 0.4)";
  watermark.style.zIndex = "999";

  contentClone.appendChild(watermark);
  document.body.appendChild(contentClone);

  html2canvas(contentClone, {
    backgroundColor: "rgb(15, 23, 42)",
    width: 640,
    windowWidth: 640,
  }).then((canvas: HTMLCanvasElement) => {
    document.body.removeChild(contentClone);
    link.href = canvas.toDataURL("image/png");
    link.download = `${title}.png`;
    link.click();
  });
}
