import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function EntryPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f6fb] text-[#17213b]">
      <div className="absolute inset-0 bg-[#f4f6fb]" />

      <div className="pointer-events-none absolute left-[-16%] top-0 h-full w-[34%] bg-[linear-gradient(90deg,rgba(203,211,236,0.24)_0%,rgba(244,246,251,0)_100%)] sm:left-[-12%] sm:w-[26%]" />
      <div className="pointer-events-none absolute right-[-16%] top-0 h-full w-[34%] bg-[linear-gradient(270deg,rgba(190,202,235,0.26)_0%,rgba(244,246,251,0)_100%)] sm:right-[-12%] sm:w-[26%]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1440px]">
          <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[26px] border border-[#e1e7f8] px-5 py-8 shadow-[0_18px_54px_rgba(20,31,60,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] sm:max-w-[860px] sm:rounded-[30px] sm:px-8 sm:py-12 lg:max-w-[1060px] lg:rounded-[36px] lg:px-14 lg:py-14">
            <div className="absolute inset-0 bg-[#f8f9fe]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(112,129,214,0.12)_0%,rgba(112,129,214,0.05)_20%,rgba(112,129,214,0)_42%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(47,87,184,0.11)_0%,rgba(47,87,184,0.045)_20%,rgba(47,87,184,0)_44%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.46)_24%,rgba(255,255,255,0)_66%)]" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[25px] border border-[#eef2fd] sm:rounded-[29px] lg:rounded-[35px]" />

            <div className="relative mx-auto flex min-h-[72vh] max-w-[320px] flex-col items-center justify-center text-center sm:min-h-[70vh] sm:max-w-[680px] lg:min-h-[520px] lg:max-w-[760px]">
              <p className="mb-4 text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-[#6e7895] sm:mb-5 sm:text-[0.78rem] sm:tracking-[0.42em]">
                Aide confidentielle au travail
              </p>

              <h1
                className={`${serif.className} text-[clamp(4.5rem,22vw,5.7rem)] font-medium leading-[0.82] tracking-[-0.082em] text-[#10224a] sm:text-[clamp(6rem,13vw,9rem)] sm:leading-[0.78] sm:tracking-[-0.095em] lg:text-[8.4rem]`}
              >
                BEST
              </h1>

              <div className="mx-auto mt-6 h-px w-[118px] bg-[linear-gradient(90deg,rgba(214,221,246,0)_0%,rgba(184,195,233,0.95)_50%,rgba(214,221,246,0)_100%)] sm:mt-7 sm:w-[150px]" />

              <p
                className={`${serif.className} mt-6 max-w-[310px] text-balance text-[1.35rem] font-normal leading-[1.16] tracking-[-0.034em] text-[#23345d] sm:mt-7 sm:max-w-[620px] sm:text-[1.9rem] sm:leading-[1.2] lg:text-[2.15rem]`}
              >
                Comprendre une situation professionnelle difficile
              </p>

              <div className="mt-8 sm:mt-10">
                <Link
                  href="/accueil"
                  className={`${serif.className} group relative inline-flex min-w-[164px] items-center justify-center overflow-hidden rounded-[17px] border border-[#d8e0f5] bg-[linear-gradient(180deg,#ffffff_0%,#f2f5fb_100%)] px-7 py-3 text-[1.55rem] font-medium leading-none tracking-[-0.03em] text-[#213763] shadow-[0_22px_46px_rgba(17,30,66,0.065),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-500 hover:-translate-y-[2px] hover:scale-[1.02] sm:min-w-[220px] sm:rounded-[20px] sm:px-10 sm:py-4 sm:text-[2rem]`}
                >
                  <span className="relative z-10">Entrer</span>
                </Link>
              </div>

              <p
                className={`${serif.className} mt-11 max-w-[285px] text-balance text-[0.9rem] leading-[1.72] tracking-[-0.012em] text-[#66789d] sm:mt-16 sm:max-w-[540px] sm:text-[1.13rem] sm:leading-[1.9]`}
              >
                Clarifier les faits, comprendre les signaux
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                et identifier les démarches possibles.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
