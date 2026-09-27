import BackBtn from "@/components/btns/BackBtn";
import Link from "next/link";
import { animateOpacity } from "@/utils/helpers";
import { animated, useSpring } from "@react-spring/web";
import type { Component } from "@/utils/types";

function TermsOfUsePage(): Component {
  const [styles] = useSpring(() => animateOpacity(1, 400));

  return (
    <animated.section
      style={styles}
      className="relative max-w-2xl w-full px-6 sm:px-0 mb-16 lg:mb-36 text-slate-200/90 text-sm sm:text-xl flex flex-col justify-start items-center gap-y-8 [&>p]:w-full [&>p]:text-pretty"
    >
      <BackBtn />
      <p>Bienvenido a Lymbrarie. Al utilizar nuestro servicio, aceptas cumplir con estos términos de uso.</p>
      <p>Lymbrarie es una aplicación gratuita para gestionar tu biblioteca personal. Te proporcionamos las herramientas para organizar tus libros, pero tú eres responsable del contenido que agregas.</p>
      <p>Debes tener al menos 13 años para usar Lymbrarie. Al crear una cuenta, garantizas que la información que proporcionas es precisa y actual.</p>
      <p>No puedes usar Lymbrarie para fines ilegales o no autorizados. Debes respetar los derechos de autor y propiedad intelectual de otros.</p>
      <p>Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, con o sin previo aviso.</p>
      <p>No garantizamos que el servicio estará disponible en todo momento sin interrupciones. No seremos responsables de ninguna pérdida de datos.</p>
      <p>Puedes eliminar tu cuenta en cualquier momento. Al hacerlo, todos tus datos serán eliminados permanentemente.</p>
      <p>Estos términos se rigen por las leyes aplicables. Cualquier disputa se resolverá en los tribunales competentes.</p>
      <p>Nos reservamos el derecho de actualizar estos términos en cualquier momento. Te notificaremos de cambios significativos.</p>
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

export default TermsOfUsePage;
