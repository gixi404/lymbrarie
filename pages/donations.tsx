import BackBtn from "@/components/btns/BackBtn";
import Link from "next/link";
import { animateOpacity } from "@/utils/helpers";
import { animated, useSpring } from "@react-spring/web";
import { CoinsIcon, HeartIcon } from "lucide-react";
import type { Component } from "@/utils/types";

function DonationsPage(): Component {
  const [styles] = useSpring(() => animateOpacity(1, 400));

  return (
    <animated.section
      style={styles}
      className="relative max-w-3xl w-full px-6 sm:px-0 mb-16 lg:mb-36 text-slate-200/90 flex flex-col justify-start items-center gap-6 md:gap-y-12"
    >
      <BackBtn />

      <div className="w-full flex justify-center">
        <div className="bg-slate-900/40 backdrop-blur-sm p-8 rounded-xl border border-blue-500/20 flex flex-col items-center gap-y-6 transition-all max-w-md w-full">
          <div className="bg-blue-400/20 p-4 rounded-full transition-transform">
            <CoinsIcon size={35} className="text-blue-400" />
          </div>
          <p className="text-2xl font-medium text-blue-200">PayPal</p>
          <Link
            href="https://paypal.com/paypalme/gixilym"
            rel="noopener noreferrer"
            target="_blank"
            className="mt-4 flex justify-center items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 hover:opacity-85 transition-opacity text-white font-medium w-full max-w-[250px]"
          >
            <span>Donar</span>
          </Link>
        </div>
      </div>

      <p className="text-xl font-medium flex items-center justify-center gap-x-2">
        <HeartIcon size={20} className="text-rose-300" />
        <span className="text-rose-100">¡Gracias por tu apoyo!</span>
        <HeartIcon size={20} className="text-rose-300" />
      </p>
    </animated.section>
  );
}

export default DonationsPage;
