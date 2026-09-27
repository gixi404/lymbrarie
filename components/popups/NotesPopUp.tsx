import DialogContainer from "../DialogContainer";
import NotesAlert from "../alerts/NotesAlert";
import useGuest from "@/hooks/useGuest";
import useLoad from "@/hooks/useLoad";
import usePopUp from "@/hooks/usePopUp";
import { CircleX as ExitIcon } from "lucide-react";
import { delay, noop } from "es-toolkit";
import type { Component, Timer } from "@/utils/types";
import { Editor } from "@tinymce/tinymce-react";
import { type Editor as EditorType } from "tinymce";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";



function isContentEmpty(str?: string): boolean {
  if (!str) return true;
  const clean = str
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return clean.length === 0;
}

function NotesPopUp(props: Props): Component {
  const { closePopUp } = usePopUp(),
    { isGuest } = useGuest(),
    [showAlert, setShowAlert] = useState<boolean>(false),
    [editorLoading, setEditorLoading] = useState<boolean>(true),
    { notes, setNotes, updateNotes, loadingFav } = props,
    { isLoading } = useLoad(),
    editorRef = useRef<EditorType | null>(null),
    autoSaveTimer = useRef<Timer | null>(null),
    originalNotesRef = useRef<string>(notes),
    latestNotesRef = useRef<string>(notes);

  useEffect(() => {
    latestNotesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (showAlert) {
      (async function () {
        await delay(5000);
        setShowAlert(false);
      })();
    }
  }, [showAlert]);

  function saveContent(contentToSave?: string): void {
    const targetContent =
      contentToSave !== undefined ? contentToSave : latestNotesRef.current;

    if (isGuest) return;

    if (navigator.onLine) {
      originalNotesRef.current = targetContent;
      updateNotes(targetContent);
    } else {
      setShowAlert(true);
    }
  }

  function handleChangeContent(content: string): void {
    if (isContentEmpty(content)) {
      if (content !== "") {
        editorRef.current?.setContent("");
      }
      setNotes("");
      latestNotesRef.current = "";

      if (isGuest || loadingFav) return;
      if ("" === originalNotesRef.current) return;

      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        saveContent("");
      }, 2000);
      return;
    }

    setNotes(content);
    latestNotesRef.current = content;

    if (isGuest || loadingFav) return;
    if (content === originalNotesRef.current) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      saveContent(content);
    }, 2000);
  }

  function handleClosePopUp(): void {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    const currentContent = editorRef.current
      ? editorRef.current.getContent()
      : latestNotesRef.current;

    const finalContent = isContentEmpty(currentContent) ? "" : currentContent;

    if (finalContent !== originalNotesRef.current) {
      saveContent(finalContent);
    }
    closePopUp("notes");
  }

  return (
    <DialogContainer
      id="notes"
      divClass="!max-w-[1200px] max-h-[950px] sm:!h-[calc(100vh-3rem)] sm:!my-6 !overflow-hidden !bg-slate-800 !p-0 !border-4"
    >
      <div className="w-full h-full flex flex-col relative">
        {editorLoading && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-20">
            <span className="loading loading-spinner loading-lg text-violet-500" />
          </div>
        )}
        <div className="flex-1 w-full overflow-hidden flex flex-col [&_iframe]:!border-0 [&_iframe]:!outline-none [&_.tox-tinymce]:!border-0 [&_.tox-tinymce]:!outline-none [&_.tox-tinymce]:!box-shadow-none [&_.tox-tinymce--focused]:!border-0 [&_.tox-tinymce--focused]:!outline-none [&_.tox-tinymce--focused]:!box-shadow-none [&_.tox-editor-container]:!border-0 [&_.tox-edit-area]:!border-0 [&_.tox-edit-area__iframe]:!border-0">
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            value={isContentEmpty(notes) ? "" : notes}
            disabled={loadingFav || isGuest}
            onEditorChange={isGuest ? noop : handleChangeContent}
            onInit={(_evt, editor) => {
              editorRef.current = editor;
              setEditorLoading(false);
              if (isContentEmpty(notes)) {
                editor.setContent("");
              }
            }}
            init={{
              theme: "silver",
              content_css: "dark",
              skin: "oxide-dark",
              placeholder: "Escribe tus notas aquí...",
              content_style:
                "body { background-color: #1e293b; color: #e2e8f0; font-family: Poppins, sans-serif; font-size: 16px; padding: 16px; border: 0 !important; outline: 0 !important; box-shadow: none !important; } * { outline: 0 !important; border: 0 !important; box-shadow: none !important; } .mce-content-body[data-mce-placeholder]::before { color: #94a3b8 !important; font-style: italic !important; opacity: 0.8 !important; }",
              height: "100%",
              menubar: false,
              statusbar: false,
              branding: false,
              resize: false,
              plugins: [
                "lists",
                "link",
                "image",
                "emoticons",
                "searchreplace",
                "autolink",
                "autosave",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright | bullist numlist | link image emoticons | removeformat",
              autosave_interval: "30s",
              autosave_retention: "30m",
            }}
          />
        </div>

        {isGuest && (
          <div className="flex-shrink-0 p-4 bg-slate-800/50 border-t border-violet-500/20">
            <p className="w-full text-sm text-slate-300/80 text-center">
              Estás en modo invitado. Las notas no se guardarán.
            </p>
          </div>
        )}
      </div>

      {showAlert && <NotesAlert />}

      <button
        disabled={isLoading}
        type="button"
        onClick={handleClosePopUp}
        className="absolute top-1 right-1 p-1 rounded-xl bg-violet-700 border border-violet-500/30 hover:bg-violet-500/40 hover:border-violet-500/40 transition-colors disabled:opacity-50 z-10"
      >
        <ExitIcon size={30} className="text-violet-200" />
      </button>
    </DialogContainer>
  );
}

export default NotesPopUp;

interface Props {
  notes: string;
  setNotes: Dispatch<SetStateAction<string>>;
  loadingFav: boolean;
  updateNotes: (updatedNotes?: string) => void;
  title: string;
}
