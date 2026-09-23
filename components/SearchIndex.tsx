import AddBookBtn from "./btns/AddBookBtn";
import LogInBtn from "./btns/LogInBtn";
import Select from "react-select";
import useGuest from "@/hooks/useGuest";
import useIsMobile from "@/hooks/useIsMobile";
import { searchAtom, stateAtom } from "@/utils/atoms";
import { BOOK_STATES } from "@/utils/states";
import { selectStyles } from "@/utils/helpers";
import { useRecoilState } from "recoil";
import type {
  Component,
  Handler,
  InputEvent,
} from "@/utils/types";
import type { SingleValue } from "react-select";

export default function SearchIndex(): Component {
  const { isGuest } = useGuest(),
    [value, setValue] = useRecoilState<string>(searchAtom),
    [selectVal, setSelectStateVal] = useRecoilState<string>(stateAtom),
    { isMobile } = useIsMobile(),
    handleSearch: Handler<InputEvent, void> = (e: InputEvent) =>
      setValue(e.target.value),
    handleSelect: Handler<string, void> = (val: string) =>
      setSelectStateVal(val),
    options = [
      { value: "", label: "Todo" },
      ...Object.values(BOOK_STATES).map(s => ({
        value: s.es,
        label: s.es,
      })),
    ],
    getPlaceholder = (): string => {
      const option = options.find(opt => opt.value === selectVal);
      return option ? option.label : "Todo";
    };

  return (
    <div className="w-full mb-0 sm:mb-10 flex flex-col items-center gap-y-8">
      <form className="w-full max-w-3xl flex flex-col items-center justify-center select-none px-3 sm:px-0">
        <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="join w-full sm:w-auto max-w-xl">
            <input
              id="input-search"
              value={value}
              onChange={handleSearch}
              className="focus:outline-0 focus:border-rose-300/10 backdrop-blur-[2px] input join-item flex-1 min-w-0 sm:w-[300px] h-14 bg-slate-800/60 border-2 border-rose-300/10 placeholder:text-slate-300/70 text-sm sm:text-lg text-slate-300 placeholder:w-full"
              placeholder="Busca en tu biblioteca"
              type="search"
              autoFocus
            />
            <Select
              className="join-item capitalize text-xs md:text-[17px] text-slate-300/70"
              id="select-state"
              isSearchable={false}
              options={options}
              placeholder={getPlaceholder()}
               value={options.find(o => o.value === selectVal) ?? null}
              styles={selectStyles(selectVal == "", false, isMobile)}
              onChange={(e: SingleValue<{ value: string; label: string }>) => e && handleSelect(e.value)}
            />
          </div>

          {isGuest ? <LogInBtn /> : <AddBookBtn />}
        </div>
      </form>
    </div>
  );
}
