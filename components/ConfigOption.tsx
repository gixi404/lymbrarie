import type { Component } from "@/utils/types";
import type { LucideIcon } from "lucide-react";

function ConfigOption(props: Props): Component {
  const {
    Icon,
    label,
    action,
    textBtn,
    isInput,
    handleChange,
    inputVal,
    isSelect,
    selectOpts,
    noReload,
  } = props;

  if (isSelect)
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-900/40 rounded-xl border border-violet-500/10 transition-colors">
        <div className="flex items-center gap-x-3">
          <div className="bg-violet-500/20 p-2 rounded-lg">
            <Icon size={24} className="text-violet-400" />
          </div>
          <label htmlFor={label} className="text-lg">
            {label}
          </label>
        </div>
        {selectOpts}
      </div>
    );

  if (isInput)
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-900/40 rounded-xl border border-violet-500/10 transition-colors">
        <div className="flex items-center gap-x-3">
          <div className="bg-violet-500/20 p-2 rounded-lg">
            <Icon size={24} className="text-violet-400" />
          </div>
          <label htmlFor={label} className="text-lg">
            {label}
          </label>
        </div>
        <input
          type="text"
          onChange={handleChange}
          value={inputVal}
          placeholder="Ingresa un apodo"
          maxLength={38}
          id={label}
          className="sm:w-[220px] w-full h-11 rounded-xl bg-slate-900/60 border border-violet-500/20 hover:border-violet-500/40 transition-colors text-center focus:outline-none placeholder:text-slate-500"
        />
      </div>
    );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-900/40 rounded-xl border border-violet-500/10 transition-colors">
      <div className="flex items-center gap-x-3">
        <div className="bg-violet-500/20 p-2 rounded-lg">
          <Icon size={24} className="text-violet-400" />
        </div>
        <label htmlFor={label} className="text-lg">
          {label}
        </label>
      </div>
      <button
        onClick={() => {
          action?.();
          if (!noReload) {
            location.reload();
          }
        }}
        id={label}
        className="sm:w-[220px] w-full h-11 rounded-xl bg-slate-900/60 border border-violet-500/20 hover:border-violet-500/40 transition-colors"
      >
        {textBtn ?? "default"}
      </button>
    </div>
  );
}

export default ConfigOption;

interface BaseProps {
  Icon: LucideIcon;
  label: string;
  action?: () => void;
  textBtn?: string;
  noReload?: boolean;
}

interface InputProps extends BaseProps {
  isInput: true;
  handleChange: (e: any) => void;
  inputVal: string;
  isSelect?: false;
  selectOpts?: never;
}

interface SelectProps extends BaseProps {
  isSelect: true;
  selectOpts: JSX.Element;
  isInput?: false;
  handleChange?: never;
  inputVal?: never;
}

interface NonInputNonSelectProps extends BaseProps {
  isInput?: false;
  handleChange?: never;
  inputVal?: never;
  isSelect?: false;
  selectOpts?: never;
}

type Props = InputProps | SelectProps | NonInputNonSelectProps;
