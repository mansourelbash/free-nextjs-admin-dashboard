import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

// Helper function to log login attempts (simplified for now)
async function logLoginAttempt(
  email: string,
  success: boolean,
  failureReason: string | null,
  req: any,
  userId?: string
) {
  try {
    const userAgent = req?.headers?.get?.('user-agent') || 'Unknown';
    const ipAddress = req?.ip || 'Unknown';

    await prisma.loginLog.create({
      data: {
        userId: userId || null,
        email,
        ipAddress,
        userAgent,
        success,
        failureReason,
      },
    });
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },      async authorize(credentials, req) {
        console.log("=== LOGIN ATTEMPT DEBUG ===");
        console.log("Credentials received:", {
          email: credentials?.email,
          passwordLength: credentials?.password?.length,
          hasPassword: !!credentials?.password
        });

        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        // Trim email to avoid whitespace issues
        const email = credentials.email.trim().toLowerCase();
        console.log("Normalized email:", email);        const user = await prisma.user.findUnique({
          where: {
            email: email
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            imageUrl: true,
            password: true,
          }
        });

        console.log("User found:", {
          exists: !!user,
          hasPassword: !!user?.password,
          passwordHashLength: user?.password?.length,
          userEmail: user?.email
        });

        if (!user) {
          // Log failed login attempt
          await logLoginAttempt(email, false, "User not found", req);
          console.log("User not found in database");
          return null;
        }

        // Check if user has a password (for credentials login)
        if (!user.password) {
          await logLoginAttempt(email, false, "No password set", req);
          console.log("User has no password set");
          return null;
        }

        console.log("About to compare passwords:");
        console.log("- Input password length:", credentials.password.length);
        console.log("- Stored hash length:", user.password.length);
        console.log("- Hash starts with:", user.password.substring(0, 10));

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log("Password comparison result:", isPasswordValid);

        if (!isPasswordValid) {
          await logLoginAttempt(email, false, "Invalid password", req);
          console.log("Password validation failed");
          return null;
        }

        console.log("Login successful for user:", user.email);
        // Log successful login
        await logLoginAttempt(email, true, null, req, user.id);

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          imageUrl: user.imageUrl,
        };
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.imageUrl = user.imageUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.imageUrl = token.imageUrl as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
