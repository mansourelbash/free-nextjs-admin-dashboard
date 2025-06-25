import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Helper function to ensure employee record exists
async function ensureEmployeeRecord(userId: string) {
  try {
    // Check if employee record already exists
    const existingEmployee = await (prisma as any).employee.findUnique({
      where: { userId }
    });
    
    if (!existingEmployee) {
      console.log('Creating employee record for user:', userId);
      
      // Get default department (if any)
      const defaultDepartment = await (prisma as any).department.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      
      // Create employee record
      await (prisma as any).employee.create({
        data: {
          userId,
          employeeId: `EMP${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
          departmentId: defaultDepartment?.id || null,
          hireDate: new Date(),
          status: 'ACTIVE'
        }
      });
      
      console.log('Employee record created successfully for user:', userId);
    } else {
      console.log('Employee record already exists for user:', userId);
    }
  } catch (error) {
    console.error('Error ensuring employee record:', error);
    // Don't throw error to avoid blocking sign-in
  }
}

// Helper function to log login attempts (simplified for now)
async function logLoginAttempt(
  email: string,
  success: boolean,
  failureReason: string | null,
  req: Request | any, // Can be NextRequest but keeping flexible
  userId?: string
) {
  try {
    const userAgent = req?.headers?.get?.('user-agent') || 'Unknown';
    const ipAddress = req?.ip || 'Unknown';

    await (prisma as any).loginLog.create({
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

export const authOptions: any = {
  // Temporarily disable adapter to test social login
  // adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
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
        console.log("Normalized email:", email);
          const user = await prisma.user.findUnique({
          where: {
            email: email
          }
        }) as any; // Type assertion to handle schema mismatch

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
        await logLoginAttempt(email, true, null, req, user.id);        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          imageUrl: user.imageUrl,
        };
      }
    }),
  ],  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },    async signIn({ user, account }: { user: any; account: any }) {
      // Allow all sign-ins for both credentials and social providers
      console.log('SignIn attempt:', { 
        provider: account?.provider, 
        email: user?.email,
        name: user?.name 
      });
      
      // For social providers, ensure user exists in database with proper role
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          let existingUser = await (prisma as any).user.findUnique({
            where: { email: user.email }
          });
          
          if (!existingUser) {
            // Create new user with default EMPLOYEE role for social logins
            const nameParts = user.name?.split(' ') || ['', ''];
            existingUser = await (prisma as any).user.create({
              data: {
                email: user.email,
                firstName: nameParts[0] || 'Unknown',
                lastName: nameParts.slice(1).join(' ') || 'User',
                role: 'EMPLOYEE', // Default role for social login users
                imageUrl: user.image || null,
                password: null, // No password for social login
                isActive: true,
                emailVerified: new Date(), // Assume email is verified by OAuth provider
              }
            });
            
            console.log('Created new social login user:', existingUser.email, 'with role:', existingUser.role);
          } else {
            // Update existing user's image if from social login
            if (user.image && existingUser.imageUrl !== user.image) {
              await (prisma as any).user.update({
                where: { id: existingUser.id },
                data: { imageUrl: user.image }
              });
            }
            console.log('Existing social login user:', existingUser.email, 'with role:', existingUser.role);
          }
            // Add user info to the user object for JWT callback
          user.id = existingUser.id;
          user.role = existingUser.role;
          user.firstName = existingUser.firstName;
          user.lastName = existingUser.lastName;
          user.imageUrl = existingUser.imageUrl;
          
          // Ensure employee record exists for leave management
          await ensureEmployeeRecord(existingUser.id);
          
        } catch (error) {
          console.error('Error handling social login user:', error);
          return false; // Deny sign-in if database operation fails
        }
      } else {
        // For credentials login, also ensure employee record exists
        if (user?.id) {
          await ensureEmployeeRecord(user.id);
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        
        // Handle imageUrl from different sources
        if (user.imageUrl) {
          // For credentials login - use existing imageUrl
          token.imageUrl = user.imageUrl;
        } else if (user.image) {
          // For social login (Google/Facebook) - use the image from OAuth
          token.imageUrl = user.image;
        }
        
        // For social login, set name parts if not already set
        if (account?.provider === 'google' || account?.provider === 'facebook') {
          if (user.name && !user.firstName && !user.lastName) {
            const nameParts = user.name.split(' ');
            token.firstName = nameParts[0] || '';
            token.lastName = nameParts.slice(1).join(' ') || '';
          }
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
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
