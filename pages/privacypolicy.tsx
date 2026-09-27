import BackBtn from "@/components/btns/BackBtn";
import Link from "next/link";
import { animateOpacity } from "@/utils/helpers";
import { animated, useSpring } from "@react-spring/web";
import type { Component } from "@/utils/types";

export default function PrivacyPolicyPage(): Component {
  const [styles] = useSpring(() => animateOpacity(1, 400));

  return (
    <animated.section
      style={styles}
      className="relative max-w-2xl w-full px-6 sm:px-0 mb-16 lg:mb-36 text-slate-200/90 text-sm sm:text-xl flex flex-col justify-start items-center gap-y-8 [&>p]:w-full [&>p]:text-pretty"
    >
      <BackBtn />
      <p>En Lymbrarie, tu privacidad es una prioridad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.</p>
      <p>Recopilamos información básica de tu cuenta (nombre, email, foto de perfil) a través de servicios de autenticación de terceros como Google y GitHub. También almacenamos los datos de tu biblioteca personal (libros, notas, estados de lectura) en Firebase.</p>
      <p>No compartimos tu información personal con terceros. Utilizamos tus datos únicamente para proporcionarte el servicio de Lymbrarie y mejorar tu experiencia. Implementamos medidas de seguridad para proteger tu información contra acceso no autorizado.</p>
      <p>Si tienes alguna pregunta sobre nuestra política de privacidad, no dudes en contactarnos.</p>
      <address className="text-sm sm:text-lg w-full">
        <Link
          className="text-blue-400 no-underline hover:text-blue-300 cursor-pointer duration-75"
          href="mailto:gixi.tsx@gmail.com"
          target="_blank"
          rel="noreferrer"
        >
          gixi.tsx@gmail.com
        </Link>
      </address>
    </animated.section>
  );
}
