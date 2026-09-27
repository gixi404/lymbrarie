import BackBtn from "@/components/btns/BackBtn";
import { animateOpacity } from "@/utils/helpers";
import { animated, useSpring } from "@react-spring/web";
import { ChevronRight, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Component, Handler } from "@/utils/types";

function FAQ(): Component {
  const [openItem, setOpenItem] = useState<number | null>(null),
    toggleItem: Handler<number, void> = (index: number) =>
      setOpenItem(openItem === index ? null : index),
    [styles] = useSpring(() => animateOpacity(1, 400));

  return (
    <animated.section
      style={styles}
      className="relative max-w-2xl w-full space-y-4 pb-24"
    >
      <BackBtn />
      <div className="w-full h-full">
        <ul className="space-y-4">
          {faqItems.map((item, i) => (
            <li
              key={i}
              className="border-2 border-gray-800 rounded-lg overflow-hidden"
            >
              <button
                className="w-full text-left p-4 focus:outline-none cursor-default bg-gray-900 transition-colors duration-200"
                onClick={() => toggleItem(i)}
              >
                <span className="float-left pr-3 pt-0.5">
                  {openItem == i ? <ChevronUp /> : <ChevronRight />}
                </span>
                <span className="font-medium text-xl">{item.question}</span>
              </button>
              {openItem == i && (
                <div className="p-4 bg-gray-900 text-lg border-t-2 border-gray-800">
                  <p className="w-full max-w-2xl">{item.answer}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </animated.section>
  );
}

export default FAQ;

const faqItems: FAQItems[] = [
  {
    question: "¿Qué es Lymbrarie?",
    answer: "Lymbrarie es una aplicación web para gestionar tu biblioteca personal. Puedes agregar libros, organizarlos por estado de lectura, añadir notas y marcar tus favoritos.",
  },
  {
    question: "¿Es gratis?",
    answer: "Sí, Lymbrarie es completamente gratuito. No hay costos ocultos ni suscripciones requeridas.",
  },
  {
    question: "¿Necesito crear una cuenta?",
    answer: "Puedes explorar la aplicación en modo invitado, pero necesitarás una cuenta de Google o GitHub para guardar tu biblioteca personal y sincronizar tus datos.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Sí, utilizamos Firebase de Google para almacenar tus datos de forma segura. Tus datos personales están protegidos y solo tú tienes acceso a tu biblioteca.",
  },
  {
    question: "¿Puedo usar Lymbrarie en mi móvil?",
    answer: "Sí, Lymbrarie es completamente responsive y funciona perfectamente en dispositivos móviles, tablets y computadoras de escritorio.",
  },
];

type FAQItems = {
  question: string;
  answer: string;
};
