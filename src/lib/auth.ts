import 'dotenv/config';
import { betterAuth } from "better-auth";
import { Pool } from 'pg';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10
  }),
  trustedOrigins: ['http://localhost:3000'],
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: false },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }
  }
});

export type Auth = typeof auth;