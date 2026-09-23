import type { Component } from "@/utils/types";
import { Pencil as Icon } from "lucide-react";

function SettingsBtn(): Component {
  return (
    <button aria-label="Opciones del libro" className="btn btn-square bg-slate-700/30 sm:bg-slate-700/25 hover:bg-slate-700/50 border-2 border-slate-700/40 mt-4 sm:mt-0 mb-1">
      <Icon className="w-5 h-5 sm:w-[26px] sm:h-[26px]" />
    </button>
  );
}

export default SettingsBtn;
