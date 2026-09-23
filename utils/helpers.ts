import type { StylesConfig } from "react-select";
import type { Handler } from "./types";
import { translateState, mapStateToEnglish, isLent } from "./states";

function selectStyles(
  showAll: boolean,
  normal: boolean,
  isMobile: boolean
): object {
  return {
    placeholder: (s: StylesConfig) => ({
      ...s,
      textAlign: "start",
      width: "100%",
      color: normal ? "#e2e8f0" : "rgb(203 213 225 / 0.7)",
    }),
    singleValue: (s: StylesConfig) => ({
      ...s,
      color: normal ? "#e2e8f0" : "rgb(203 213 225 / 0.7)",
    }),
    control: (s: StylesConfig) => ({
      ...s,
      padding: "0 0.5rem",
      backgroundColor: normal ? "transparent" : "rgb(30 41 59 / 0.6)",
      borderWidth: normal ? 1 : 2,
      borderColor: normal
        ? "rgb(139 92 246 / 0.32)"
        : showAll
        ? "rgb(253 164 175 / 0.1)"
        : "rgb(196 181 253 / 0.4)",
      width: isMobile ? (normal ? "100%" : "135px") : normal ? "100%" : "180px",
      height: normal ? "3rem" : "3.5rem",
      boxShadow: 0,
      borderTopLeftRadius: normal ? "0.8rem" : 0,
      borderBottomLeftRadius: normal ? "0.8rem" : 0,
      borderTopRightRadius: "0.8rem",
      borderBottomRightRadius: "0.8rem",
      ":hover": { borderColor: "rgb(196 181 253 / 0.4)" },
    }),
    option: (s: StylesConfig) => ({
      ...s,
      backgroundColor: "transparent",
      border: 0,
      color: "rgb(203 213 225 / 0.9)",
      fontSize: "1rem",
      padding: "5px 10px",
      ":hover": {
        backgroundColor: "rgb(253 164 175 / 0.1)",
      },
    }),
    menu: (s: StylesConfig) => ({
      ...s,
      backgroundColor: "rgb(30 41 59)",
      marginTop: 4,
      borderRadius: "0.6rem",
      border: "2px solid rgb(253 164 175 / 0.1)",
    }),
    dropdownIndicator: (s: StylesConfig) => ({
      ...s,
      backgroundColor: "transparent",
      color: "rgba(167,139,250,0.7)",
      "&:hover": {
        backgroundColor: "transparent",
        color: "rgba(167,139,250,0.7)",
      },
    }),
    indicatorSeparator: () => ({ backgroundColor: "transparent" }),
  };
}

function translateGender(gender: string): string {
  const genderMap: Record<string, string> = {
    custom: "Personalizado",
    "no-gender": "Sin asignar",
    fiction: "Ficción",
    "non-fiction": "No ficción",
    religion: "Religión",
    mystery: "Misterio",
    fantasy: "Fantasía",
    essay: "Ensayo",
    romance: "Romance",
    horror: "Terror",
    thriller: "Thriller",
    novel: "Novela",
    history: "Historia",
    biography: "Biografía",
    "self-help": "Autoayuda",
    poetry: "Poesía",
    drama: "Drama",
    adventure: "Aventura",
    psychology: "Psicología",
    "young-adult": "Juvenil",
    "children's": "Infantil",
    philosophy: "Filosofía",
    economy: "Economía",
    constabulary: "Policial",
    science: "Ciencia",
    dystopia: "Distopía",
    other: "Otro",
  };

  const lowerGender = gender?.toLowerCase().trim();
  return genderMap[lowerGender] || gender;
}

function pathIs(path: string, options?: PathOptions): boolean {
  const pathname: string = window?.location?.pathname;
  if (options?.exact) return pathname === path;
  return pathname.includes(path);
}

const removeItem: Handler<string, void> = item =>
  window?.localStorage?.removeItem(item);

const clearStorage: Handler<void, void> = () => window?.localStorage?.clear();

const tLC: Handler<string, string> = val => val?.toLowerCase().trim();

const len = (val: string | unknown[] | null | undefined): number => val?.length ?? 0;

const animateOpacity = (
  to: number,
  duration: number,
  delay?: number
): AnimateOpacity => ({
  from: { opacity: 0 },
  to: { opacity: to },
  config: { duration: duration },
  delay: delay ?? 0,
});

const animatePopup = (): AnimatePopup => ({
  from: { transform: "scale(0.7)" },
  to: { transform: "scale(1)" },
  config: { duration: 120 },
});

export {
  animateOpacity,
  animatePopup,
  clearStorage,
  isLent,
  len,
  mapStateToEnglish,
  removeItem,
  selectStyles,
  tLC,
  translateState,
  translateGender,
  pathIs,
};
interface AnimateOpacity {
  from: { opacity: number };
  to: { opacity: number };
  config: { duration: number };
  delay: number;
}

interface PathOptions {
  exact?: boolean;
}
interface AnimatePopup {
  from: { transform: string };
  to: { transform: string };
  config: { duration: number };
}

export type { AnimateOpacity, PathOptions, AnimatePopup };
