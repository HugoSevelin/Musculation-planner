"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

const LIME = "#b8ff00"
const BORDER = "rgba(255,255,255,0.07)"

const FEATURES = [
  {
    tag: "01",
    title: "Programme hebdo",
    desc: "Configure tes séances jour par jour. PPL, Full Body, Upper/Lower — adapte à ta routine.",
    accent: LIME,
  },
  {
    tag: "02",
    title: "Logging en temps réel",
    desc: "Coche tes séries au fur et à mesure. Poids, reps, durée — tout est enregistré.",
    accent: "#00e5ff",
  },
  {
    tag: "03",
    title: "Stats & PRs",
    desc: "Suis tes records, ton volume par muscle et l'évolution de tes performances.",
    accent: "#ff7700",
  },
]

const SPORTS = ["Musculation", "Cardio", "Natation", "Boxe", "CrossFit", "Cyclisme", "Course à pied", "Sport collectif"]

export default function LandingPage() {
  const { data: session } = useSession()
  const isSignedIn = !!session

  return (
    <div className="flex min-h-svh flex-col bg-[#0d0d0d]">
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#444]">Journal d&apos;entraînement</p>
          <p className="text-lg font-black leading-none tracking-tight" style={{ color: LIME }}>
            GUERRIER
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Button asChild className="rounded-none bg-[#b8ff00] text-[#0d0d0d] font-black uppercase tracking-widest text-xs hover:opacity-80">
              <Link href="/dashboard">Mon espace →</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-xs uppercase tracking-widest text-[#555] hover:text-[#efefef] transition-colors"
              >
                Connexion
              </Link>
              <Button asChild className="rounded-none bg-[#b8ff00] text-[#0d0d0d] font-black uppercase tracking-widest text-xs hover:opacity-80">
                <Link href="/sign-up">Commencer</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-start px-5 pt-16 pb-12" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <span
          className="mb-4 inline-block px-2 py-1 font-mono text-[9px] uppercase tracking-[0.3em]"
          style={{ backgroundColor: "rgba(184,255,0,0.1)", color: LIME, border: `1px solid rgba(184,255,0,0.2)` }}
        >
          Gratuit · Privé · Sans pub
        </span>
        <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-[#efefef]">
          Ton journal<br />
          d&apos;entraî&shy;nement<br />
          <span style={{ color: LIME }}>militaire.</span>
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-[#555]">
          Programme tes séances, log tes séries en direct,<br />
          et suis ta progression semaine après semaine.
        </p>
        <div className="mt-8 flex flex-col gap-3 w-full">
          <Button
            asChild
            className="w-full rounded-none bg-[#b8ff00] text-[#0d0d0d] font-black uppercase tracking-widest py-6 text-sm hover:opacity-80"
            style={{ boxShadow: `0 0 32px rgba(184,255,0,0.2)` }}
          >
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              {isSignedIn ? "Continuer l'entraînement →" : "Créer mon journal d\u2019entraînement gratuitement →"}
            </Link>
          </Button>
          {!isSignedIn && (
            <Button asChild variant="ghost" className="w-full rounded-none text-[#444] text-xs uppercase tracking-widest hover:text-[#efefef] hover:bg-transparent">
              <Link href="/sign-in">J&apos;ai déjà un compte</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Sports */}
      <section className="px-5 py-6 overflow-hidden" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.3em] text-[#333]">Compatible avec</p>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => (
            <span
              key={sport}
              className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#555]"
              style={{ border: `1px solid ${BORDER}` }}
            >
              {sport}
            </span>
          ))}
          <span
            className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest"
            style={{ border: `1px solid rgba(184,255,0,0.2)`, color: LIME }}
          >
            + personnalisé
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col" style={{ borderBottom: `1px solid ${BORDER}` }}>
        {FEATURES.map((f, i) => (
          <div
            key={f.tag}
            className="px-5 py-6"
            style={{ borderBottom: i < FEATURES.length - 1 ? `1px solid ${BORDER}` : "none" }}
          >
            <div className="flex items-start gap-4">
              <span className="font-mono text-xs font-bold pt-0.5 shrink-0" style={{ color: f.accent }}>
                {f.tag}
              </span>
              <div>
                <p className="text-base font-bold text-[#efefef]">{f.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#555]">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Social proof / Stats */}
      <section className="px-5 py-8" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#333] mb-6">Pourquoi Guerrier</p>
        <div className="grid grid-cols-2 gap-px" style={{ border: `1px solid ${BORDER}` }}>
          {[
            { val: "65+", label: "Exercices inclus" },
            { val: "100%", label: "Données privées" },
            { val: "0€", label: "Pour toujours" },
            { val: "∞", label: "Séances loggées" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="px-4 py-5 bg-[#0d0d0d]"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <p className="font-mono text-2xl font-black" style={{ color: LIME }}>{stat.val}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-[#444]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-12">
        <p className="text-2xl font-black text-[#efefef] leading-tight">
          Prêt à tracker<br />
          <span style={{ color: LIME }}>sérieusement ?</span>
        </p>
        <p className="mt-3 text-sm text-[#444]">Connexion avec Google ou email. Aucune carte bancaire requise.</p>
        <Button
          asChild
          className="mt-6 w-full rounded-none bg-[#b8ff00] text-[#0d0d0d] font-black uppercase tracking-widest py-6 text-sm hover:opacity-80"
        >
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            {isSignedIn ? "Aller à mon dashboard →" : "C'est parti →"}
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer
        className="px-5 py-4 mt-auto"
        style={{ borderTop: `1px solid ${BORDER}` }}
      >
        <p className="font-mono text-[9px] text-[#333] text-center uppercase tracking-widest">
          Guerrier · Données stockées localement · Aucun serveur
        </p>
      </footer>
    </div>
  )
}
