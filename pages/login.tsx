import Favicon from "@/public/favicon.ico";
import FooterIndex from "@/components/FooterIndex";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import LoaderCircle from "@/components/LoaderCircle";
import { animateOpacity } from "@/utils/helpers";
import { animated, useSpring } from "@react-spring/web";
import { AuthAction, withUser } from "next-firebase-auth";
import { GithubIcon, GoogleIcon } from "@/utils/svgs";
import { notification } from "@/utils/notifications";
import { PAGES } from "@/utils/consts";
import {
  BookMarkedIcon,
  BookOpenIcon,
  GhostIcon,
  SparklesIcon,
  CircleAlertIcon,
} from "lucide-react";
import type { Component } from "@/utils/types";
import {
  type Auth,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default withUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.RENDER,
  LoaderComponent: LoaderCircle,
})(LoginPage);

function LoginPage(): Component {
  const auth: Auth = getAuth(),
    [styles] = useSpring(() => animateOpacity(1, 400));

  async function logIn(provider: Providers): Promise<void> {
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      notification("error", "Error al iniciar sesión");
      console.error(`catch 'logIn' ${err.message}`);
    }
  }

  function withGoogle(): void {
    const provider: GoogleAuthProvider = new GoogleAuthProvider();
    logIn(provider);
  }

  function withGithub(): void {
    const provider: GithubAuthProvider = new GithubAuthProvider();
    logIn(provider);
  }

  return (
    <animated.section
      style={styles}
      className="bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 flex items-center flex-col justify-between top-0 right-0 min-h-screen w-full gap-y-20 md:gap-y-24 bg-transparent"
    >
      <Head>
        <meta name="title" content="Lymbrarie - Tu biblioteca personal" />
        <meta
          name="description"
          content="La mejor forma de organizar tu biblioteca"
        />
      </Head>

      <header className="relative flex items-center justify-between w-full max-w-3xl pt-6 px-6 lg:px-0">
        <div className="flex items-center gap-x-3">
          <Image
            width={38}
            height={38}
            className="border rounded-full border-gray-700"
            src={Favicon.src}
            alt="logo"
            loading="eager"
          />
          <h1 className="text-xl font-semibold text-slate-100">Lymbrarie</h1>
        </div>
      </header>

      <section className="px-4 sm:px-0 z-50 flex w-full flex-col items-center justify-center max-w-2xl gap-y-4 relative">
        <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-violet-300 via-violet-50 to-violet-300 text-transparent bg-clip-text text-center">
          ¡Bienvenido a Lymbrarie!
        </h2>
        <p className="text-lg md:text-xl text-slate-200/90 text-center">
          La mejor forma de organizar tu Biblioteca
        </p>
        <div className="pt-6 items-center justify-center flex flex-col gap-y-3">
          <button
            type="button"
            onClick={withGoogle}
            className="bg-slate-950/25 hover:bg-slate-950/55 backdrop-blur-sm border border-violet-500/20 hover:border-violet-500/40
              flex items-center justify-start gap-x-6 px-10 w-full max-w-[410px] h-14 rounded-xl transition-all"
          >
            <GoogleIcon className="size-7" />
            <p className="text-lg text-slate-200">Iniciar sesión con Google</p>
          </button>

          <button
            type="button"
            onClick={withGithub}
            className="bg-slate-950/25 hover:bg-slate-950/55 backdrop-blur-sm border border-violet-500/20 hover:border-violet-500/40
              flex items-center justify-start gap-x-6 px-10 w-full max-w-[410px] h-14 rounded-xl transition-all"
          >
            <GithubIcon className="size-7" />
            <p className="text-lg text-slate-200">Iniciar sesión con Github</p>
          </button>

          <Link
            href={PAGES.GUEST}
            className="bg-slate-950/25 hover:bg-slate-950/55 backdrop-blur-sm border border-violet-500/20 hover:border-violet-500/40
              flex items-center justify-start gap-x-6 px-10 w-full max-w-[410px] h-14 rounded-xl transition-all"
          >
            <GhostIcon className="size-7 text-violet-300" />
            <p className="text-lg text-slate-200">Acceder como Invitado</p>
          </Link>
        </div>
      </section>

      <section
        id="sect"
        className="flex flex-wrap justify-center items-center gap-16 max-w-4xl w-full mb-10"
      >
        <article className="relative bg-slate-900/40 z-50 w-[350px] border border-slate-800 rounded-lg p-4 md:p-6">
          <div className="bg-violet-500/20 p-3 rounded-lg w-max mb-4">
            <BookOpenIcon className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-100 mb-2">
            Organiza tu biblioteca
          </p>
          <p className="text-sm md:text-lg text-gray-300/85">
            Catáloga y organiza tus libros con opciones de filtrado y clasificación.
          </p>
        </article>
        <article className="relative bg-slate-900/40 z-50 w-[350px] border border-slate-800 rounded-lg p-4 md:p-6">
          <div className="bg-violet-500/20 p-3 rounded-lg w-max mb-4">
            <BookMarkedIcon className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-100 mb-2">
            Seguimiento de lecturas
          </p>
          <p className="text-sm md:text-lg text-gray-300/85">
            Controla tu progreso y obtén datos relevantes sobre tus lecturas.
          </p>
        </article>
        <article className="relative bg-slate-900/40 z-50 w-[350px] border border-slate-800 rounded-lg p-4 md:p-6">
          <div className="bg-violet-500/20 p-3 rounded-lg w-max mb-4">
            <SparklesIcon className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-100 mb-2">
            Descubre nuevos libros
          </p>
          <p className="text-sm md:text-lg text-gray-300/85">
            Explora nuevos libros y autores con recomendaciones personalizadas.
          </p>
        </article>
        <article className="relative bg-slate-900/40 z-50 w-[350px] border-red-400/20 border-2 rounded-lg p-4 md:p-6">
          <div className="bg-red-500/20 p-3 rounded-lg w-max mb-4">
            <CircleAlertIcon className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-100 mb-2">
            Importante
          </p>
          <p className="text-sm md:text-[16px] text-gray-300/85">
            Lymbrarie NO es una red social para compartir reseñas, seguir usuarios o dar likes. Es un espacio privado para registrar tus lecturas.
          </p>
        </article>
      </section>

      <FooterIndex />
    </animated.section>
  );
}

type Providers = GithubAuthProvider | GoogleAuthProvider;
