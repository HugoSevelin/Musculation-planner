import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // Simple demo auth — remplace par ta DB plus tard
        if (!credentials?.email || !credentials?.password) return null
        return {
          id: String(credentials.email),
          email: String(credentials.email),
          name: String(credentials.email).split("@")[0],
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: { strategy: "jwt" },
})
