import 'dotenv/config';
import { betterAuth } from "better-auth";
import { db } from "./db";
import { Pool } from 'pg';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
});

export type Auth = typeof auth;