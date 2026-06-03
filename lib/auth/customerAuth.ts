import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import type { NextAuthOptions } from "next-auth";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "customer-credentials",
    name: "Customer Login",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      await connectDB();

      const customer = await Customer.findOne({ email: credentials.email });
      if (!customer) throw new Error("Invalid email or password");

      if (!customer.password) {
        throw new Error(
          "This account uses Google sign-in. Please use the Google button."
        );
      }

      const isValid = await customer.comparePassword(credentials.password);
      if (!isValid) throw new Error("Invalid email or password");

      return {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        role: "customer",
      };
    },
  }),
];

// Conditionally add Google provider only if credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const customerAuthOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existing = await Customer.findOne({ email: user.email });
        if (!existing) {
          await Customer.create({
            name: user.name || "Customer",
            email: user.email,
            provider: "google",
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        await connectDB();
        const customer = await Customer.findOne({ email: user.email }).lean();
        if (customer) {
          token.customerId = (customer as Record<string, unknown>)._id?.toString();
          token.role = "customer";
          token.name = (customer as Record<string, unknown>).name as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.customerId as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
