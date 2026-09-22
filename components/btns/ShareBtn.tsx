import html2canvas from "html2canvas-pro";
import { Share2 as Icon } from "lucide-react";
import type { Component } from "@/utils/types";

function ShareBtn({ title }: { title: string }): Component {
  return (
    <button
      type="button"
      onClick={() => handleShare(title)}
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
    stateCont = contentClone.querySelector("#state-cont"),
    watermark = document.createElement("div"),
    link = document.createElement("a");

  contentClone.style.padding = "20px";
  contentClone.style.border = "3px solid rgba(139,92,246,0.3)";
  contentClone.style.height = "auto";
  contentClone.style.borderRadius = "0px";
  if (stateCont instanceof HTMLElement) stateCont.style.opacity = "0";
  if (iconsClone instanceof HTMLElement) iconsClone.style.opacity = "0";

  watermark.textContent = "lymbrarie.vercel.app";
  watermark.style.position = "absolute";
  watermark.style.bottom = "8px";
  watermark.style.right = "12px";
  watermark.style.fontSize = "16px";
  watermark.style.color = "rgba(255, 255, 255, 0.4)";
  watermark.style.zIndex = "999";

  contentClone.appendChild(watermark);
  document.body.appendChild(contentClone);

  html2canvas(contentClone, { backgroundColor: "rgb(2,6,23)" }).then(
    (canvas: HTMLCanvasElement) => {
      document.body.removeChild(contentClone);
      link.href = canvas.toDataURL("image/png");
      link.download = `${title}.png`;
      link.click();
    }
  );
}
