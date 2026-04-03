"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const LIME = "#b8ff00"
const BORDER = "rgba(255,255,255,0.07)"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) setError("Email ou mot de passe incorrect")
    else router.push("/dashboard")
  }

  async function handleGoogle() {
    setLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#0d0d0d] px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#444]">Journal de guerrier</p>
          <p className="mt-1 text-2xl font-black tracking-tight" style={{ color: LIME }}>GUERRIER</p>
        </div>

        <div style={{ border: `1px solid ${BORDER}`, backgroundColor: "#111" }}>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#444]">Connexion</p>
          </div>

          <div className="px-5 py-5 flex flex-col gap-3">
            {/* Google */}
            <Button
              onClick={handleGoogle}
              disabled={loading}
              variant="outline"
              className="w-full rounded-none border-white/10 bg-transparent text-[#efefef] hover:bg-white/5 hover:text-[#efefef] gap-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: BORDER }} />
              <span className="font-mono text-[10px] text-[#333]">ou</span>
              <div className="flex-1 h-px" style={{ backgroundColor: BORDER }} />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmail} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-none border-white/10 bg-[#1a1a1a] text-[#efefef] placeholder:text-[#444] focus-visible:border-[#b8ff00] focus-visible:ring-0"
              />
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-none border-white/10 bg-[#1a1a1a] text-[#efefef] placeholder:text-[#444] focus-visible:border-[#b8ff00] focus-visible:ring-0"
              />
              {error && (
                <p className="font-mono text-[11px] text-[#ff3333]">{error}</p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-none font-black uppercase tracking-widest"
                style={{ backgroundColor: LIME, color: "#0d0d0d" }}
              >
                {loading ? "..." : "Se connecter →"}
              </Button>
            </form>
          </div>

          <div className="px-5 py-4 text-center" style={{ borderTop: `1px solid ${BORDER}` }}>
            <p className="text-xs text-[#444]">
              Pas encore de compte ?{" "}
              <Link href="/sign-up" className="transition-colors hover:text-[#efefef]" style={{ color: LIME }}>
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
