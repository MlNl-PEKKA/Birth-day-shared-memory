import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "./lib/prisma";



export const authOptions: NextAuthOptions = {

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

     
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (user) {
          const isPasswordValid = await compare(credentials.password, user.password);
          if (isPasswordValid) {
            return {
              id: user.id,
              email: user.email,
              name: user.company_name,
              role: "USER"
            };
          }
        }

        const admin = await prisma.admin.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (admin) {
          const isPasswordValid = await compare(credentials.password, admin.password);
          if (isPasswordValid) {
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role 
            };
          }
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as "USER" | "ADMIN" | "SUPER_ADMIN";
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};


export default authOptions;