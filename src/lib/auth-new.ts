import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

// Helper function to log login attempts
async function logLoginAttempt(
  email: string,
  success: boolean,
  failureReason: string | null,
  req: any,
  userId?: string
) {
  try {
    const userAgent = req?.headers?.get?.('user-agent') || 'Unknown';
    const forwardedFor = req?.headers?.get?.('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : req?.ip || 'Unknown';

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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          // Log failed login attempt
          await logLoginAttempt(credentials.email, false, "User not found", req);
          return null;
        }

        // Check if user has a password (for credentials login)
        if (!user.password) {
          await logLoginAttempt(credentials.email, false, "No password set", req);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          await logLoginAttempt(credentials.email, false, "Invalid password", req);
          return null;
        }

        // Log successful login
        await logLoginAttempt(credentials.email, true, null, req, user.id);

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
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
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.imageUrl = user.imageUrl;
      }
      
      // Add account type for social logins
      if (account) {
        token.provider = account.provider;
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
        session.user.provider = token.provider as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For social logins, create user if doesn't exist
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Create new user from social login
            await prisma.user.create({
              data: {
                email: user.email!,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                imageUrl: user.image,
                emailVerified: new Date(),
                role: 'EMPLOYEE',
              }
            });
          }

          // Log social login
          await logLoginAttempt(user.email!, true, null, null, user.id);
        } catch (error) {
          console.error('Error handling social login:', error);
          return false;
        }
      }
      
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
