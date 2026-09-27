import { popupsAtom } from "@/utils/atoms";
import { useRecoilState } from "recoil";
import type { Handler, PopupIds } from "@/utils/types";

function usePopUp(): PopUp {
  const [modal, setModals] = useRecoilState<any>(popupsAtom);

  const closePopUp: Pop = id => setModals({ ...modal, [id]: false });

  const openPopUp: Pop = id => setModals({ ...modal, [id]: true });

  function closeBookPopUps(): void {
    closePopUp("offline");
    closePopUp("delete_book");
    closePopUp("edit_book");
    closePopUp("add_book");
    closePopUp("notes");
    closePopUp("recommendation");
    closePopUp("history");
  }

  function closeAllPopUps(): void {
    closeBookPopUps();
    closePopUp("login");
  }

  return { closePopUp, openPopUp, closeBookPopUps, closeAllPopUps };
}

export default usePopUp;

interface PopUp {
  closePopUp: Pop;
  openPopUp: Pop;
  closeBookPopUps: () => void;
  closeAllPopUps: () => void;
}

type Pop = Handler<PopupIds, void>;
