import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// patch the default adapter so it doesn't crash if an account already exists
function CustomPrismaAdapter(prismaClient) {
    const base = PrismaAdapter(prismaClient);

    return {
        ...base,
        async createAccount(accountInfo) {
            try {
                return await base.createAccount(accountInfo);
            } catch (err) {
                if (err.code === "P2002") {
                    // just get existing account if one already there (don't throw)
                    return prisma.account.findUnique({
                        where: {
                            provider_providerAccountId: {
                                provider: accountInfo.provider,
                                providerAccountId: accountInfo.providerAccountId,
                            },
                        },
                    });
                }
                throw err;
            }
        },
    };
}

export const authOptions = {
    adapter: CustomPrismaAdapter(prisma),

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),

        CredentialsProvider({
            name: "Email & Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(creds) {
                const user = await prisma.user.findUnique({
                    where: { email: creds.email },
                });

                if (!user) {
                    throw new Error("No user found with that email");
                }

                const isMatch = await bcrypt.compare(creds.password, user.password);
                if (!isMatch) {
                    throw new Error("Wrong password, try again");
                }

                return user;
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/login",  // this page handles login
        newUser: "/register",  // this one handles registration flow
    },

    secret: process.env.NEXTAUTH_SECRET,
};


// this lets NextAuth handle both GET and POST automatically
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
