import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciales faltantes")
          throw new Error("Email y contraseña son requeridos")
        }

        try {
          console.log("🔄 Iniciando proceso de autenticación...")
          console.log(`📧 Email: ${credentials.email}`)

          // Conectar a la base de datos
          await dbConnect()
          console.log("✅ Conexión a base de datos establecida")

          // Buscar usuario con timeout personalizado
          console.log(`🔍 Buscando usuario...`)

          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          })
            .select("+password")
            .maxTimeMS(5000) // Timeout de 5 segundos

          if (!user) {
            console.log("❌ Usuario no encontrado en la base de datos")
            throw new Error("Credenciales inválidas")
          }

          console.log("✅ Usuario encontrado:", user.email)
          console.log("🔐 Verificando contraseña...")

          // Verificar contraseña
          const isPasswordMatch = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordMatch) {
            console.log("❌ Contraseña incorrecta")
            throw new Error("Credenciales inválidas")
          }

          console.log("✅ Autenticación exitosa")

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("❌ Error completo en authorize:", error)

          if (error.name === "MongooseError" || error.message.includes("buffering timed out")) {
            throw new Error("Error de conexión a la base de datos. Intenta de nuevo.")
          }

          throw error
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
