import NewBookPopUp from "./popups/NewBookPopUp";
import OfflinePopUp from "./popups/OfflinePopUp";
import { popupsAtom } from "@/utils/atoms";
import { useRecoilState } from "recoil";
import type { Component } from "@/utils/types";
import LogInPopUp from "./popups/LogInPopUp";
import SuggestionsPopUp from "./popups/SuggestionsPopUp";

function Popups({ UID }: Props): Component {
  const [popup] = useRecoilState<any>(popupsAtom);

  return (
    <>
      {popup.add_book && <NewBookPopUp UID={UID} />}
      {popup.offline && <OfflinePopUp />}
      {popup.login && <LogInPopUp />}
      {popup.suggestions && <SuggestionsPopUp />}
    </>
  );
}

export default Popups;

interface Props {
  UID: string;
}
