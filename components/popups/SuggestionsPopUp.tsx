import { useState, useEffect } from "react";
import usePopUp from "@/hooks/usePopUp";
import type { Component } from "@/utils/types";
import { MegaphoneIcon as Icon } from "lucide-react";
import DialogContainer from "../DialogContainer";
import HeaderPopUp from "../HeaderPopUp";
import { COLLECTION_SUGGESTIONS } from "@/utils/consts";
import { addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

interface Suggestion {
  id: string;
  text: string;
  createdAt: any;
}

function formatSuggestionDate(createdAt: any): string {
  if (!createdAt) return "";
  const date =
    typeof createdAt?.toDate === "function"
      ? createdAt.toDate()
      : new Date(createdAt);
  if (isNaN(date.getTime())) return "";

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const day = date.getDate();
  const month = date
    .toLocaleDateString("es-ES", { month: "short" })
    .replace(".", "");
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day} ${month} ${year}`;
}

function SuggestionsPopUp(): Component {
  const { closePopUp } = usePopUp();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(COLLECTION_SUGGESTIONS, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sugs: Suggestion[] = [];
        snapshot.forEach((doc) => {
          sugs.push({ id: doc.id, ...doc.data() } as Suggestion);
        });
        setSuggestions(sugs);
      },
      (_error) => {
        // Silenciosamente capturar errores si la colección lymbrarie_suggestions no tiene permisos de lectura públicos en Firestore
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const textVal = newSuggestion.trim();
    if (!textVal) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Enviando sugerencia...");

    try {
      // 1. Notificar por la API local (correo)
      await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textVal }),
      });

      // 2. Intentar guardar en Firestore (si las reglas de la base de datos están configuradas)
      try {
        await addDoc(COLLECTION_SUGGESTIONS, {
          text: textVal,
          createdAt: serverTimestamp(),
        });
      } catch (_fsErr) {
        // Ignorar de forma segura si las reglas de Firestore restringen la escritura
      }

      // 3. Añadir a la lista local para respuesta inmediata en la UI
      setSuggestions((prev) => {
        if (prev.some((s) => s.text === textVal)) return prev;
        return [
          {
            id: Date.now().toString(),
            text: textVal,
            createdAt: { toDate: () => new Date() },
          },
          ...prev,
        ];
      });

      setNewSuggestion("");
      toast.success("¡Sugerencia enviada! Gracias.", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Hubo un error al enviar la sugerencia", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContainer
      id="suggestions"
      divClass="items-start max-w-2xl w-full justify-start min-h-0 h-auto sm:h-auto my-auto sm:my-0 sm:mt-10 rounded-2xl sm:rounded-xl"
    >
      <HeaderPopUp icon={<Icon size={30} />} title="Buzón de Sugerencias" />

      <div className="w-full flex flex-col gap-y-5 px-1 sm:px-6 mt-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
          <div className="relative w-full">
            <textarea
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder="Escribe tu sugerencia aquí..."
              maxLength={500}
              className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-xl p-4 pb-7 text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none h-32"
              disabled={isSubmitting}
              required
            />
            <span className="absolute bottom-3 right-4 text-xs text-slate-400 font-sans pointer-events-none select-none">
              {newSuggestion.length}/500
            </span>
          </div>
          <div className="flex justify-end gap-x-3">
            <button
              type="button"
              onClick={() => closePopUp("suggestions")}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
              disabled={isSubmitting}
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !newSuggestion.trim()}
            >
              {isSubmitting ? "Enviando..." : "Enviar sugerencia"}
            </button>
          </div>
        </form>

        <div className="divider before:bg-slate-700/50 after:bg-slate-700/50 my-1" />

        <div className="flex flex-col gap-y-4 max-h-[40vh] overflow-y-auto pr-2 pb-4">
          <h3 className="font-semibold text-lg text-slate-200">Sugerencias recientes</h3>

          {suggestions.length === 0 ? (
            <p className="text-slate-400 text-center py-6 italic text-sm">
              Aún no hay sugerencias. ¡Sé el primero en aportar una idea!
            </p>
          ) : (
            suggestions.map((sug) => (
              <div
                key={sug.id}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-y-2"
              >
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{sug.text}</p>
                {sug.createdAt && (
                  <span className="text-xs text-slate-500 font-medium self-end">
                    {formatSuggestionDate(sug.createdAt)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DialogContainer>
  );
}

export default SuggestionsPopUp;
