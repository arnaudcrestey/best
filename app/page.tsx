import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function EntryPage() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f4f7ff] text-[#071126]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.13),transparent_34rem),linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)]" />

      <div className="pointer-events-none absolute left-[-18%] top-[-10%] h-[55vh] w-[55vh] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-20%] bottom-[-12%] h-[55vh] w-[55vh] rounded-full bg-indigo-400/12 blur-3xl" />

      <section className="relative z-10 flex min-h-svh items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-[430px] overflow-hidden rounded-[30px] border border-white/80 bg-white/72 px-6 py-9 text-center shadow-[0_24px_70px_rgba(37,99,235,0.10)] backdrop-blur-xl sm:max-w-[860px] sm:px-10 sm:py-14 lg:max-w-[1040px] lg:rounded-[38px] lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.12),transparent_34rem)]" />
          <div className="pointer-events-none absolute inset-[1px] rounded-[29px] border border-[#dbe7ff] lg:rounded-[37px]" />

          <div className="relative mx-auto flex min-h-[70svh] max-w-[330px] flex-col items-center justify-center sm:min-h-[620px] sm:max-w-[720px] lg:min-h-[540px]">
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f5fe5] text-2xl shadow-[0_18px_36px_rgba(37,99,235,0.22)] sm:h-16 sm:w-16">
              ⚖️
            </div>

            <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-[#49627f] sm:text-[0.78rem] sm:tracking-[0.44em]">
              Bien-être des salariés au travail
            </p>

            <h1
  className="
    text-[clamp(2rem,8vw,3rem)]
    font-semibold
    tracking-[0.45em]
    text-[#10224a]
    uppercase
  "
>
  B.E.S.T
</h1>

            <div className="mx-auto mt-6 h-px w-[120px] bg-[linear-gradient(90deg,rgba(37,99,235,0)_0%,rgba(37,99,235,0.48)_50%,rgba(37,99,235,0)_100%)] sm:mt-8 sm:w-[170px]" />

            <p
              className={`${serif.className} mt-6 max-w-[310px] text-balance text-[1.42rem] leading-[1.14] tracking-[-0.04em] text-[#1a2f55] sm:mt-8 sm:max-w-[680px] sm:text-[2.15rem] sm:leading-[1.12]`}
            >
              Faire le point sur une situation professionnelle difficile
            </p>

            <p className="mt-5 max-w-[300px] text-balance text-sm leading-6 text-[#52657f] sm:max-w-[560px] sm:text-base sm:leading-7">
              Un premier niveau d'analyse pour prendre du recul,
structurer les éléments importants
et éclairer les décisions à venir.
            </p>

            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center">
              <Link
                href="/accueil"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#1f5fe5] px-7 py-4 text-sm font-bold text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-[#174fc4] sm:w-auto sm:min-w-[190px]"
              >
                Entrer
              </Link>

              
            </div>

            <div className="mt-10 w-full sm:mt-14">
  <div className="flex flex-col gap-3 rounded-[28px] border border-[#dce7fa] bg-white/60 p-5 sm:flex-row sm:items-center sm:justify-center sm:gap-10 sm:p-6">
    <div className="text-center">
      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#71819c]">
        Confidentialité
      </p>
      <p className="mt-1 text-sm font-semibold text-[#0f1b33]">
        Expression libre
      </p>
    </div>

    <div className="hidden h-8 w-px bg-[#dce7fa] sm:block" />

    <div className="text-center">
      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#71819c]">
        Analyse
      </p>
      <p className="mt-1 text-sm font-semibold text-[#0f1b33]">
        Lecture structurée
      </p>
    </div>

    <div className="hidden h-8 w-px bg-[#dce7fa] sm:block" />

    <div className="text-center">
      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#71819c]">
        Accès
      </p>
      <p className="mt-1 text-sm font-semibold text-[#0f1b33]">
        Gratuit
      </p>
    </div>
  </div>
</div>
        </div>
      </section>
    </main>
  );
}
