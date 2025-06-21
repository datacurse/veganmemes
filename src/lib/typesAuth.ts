import { Generated } from "kysely";

export interface UserTable {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface SessionTable {
  id: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface AccountTable {
  id: string;
  providerId: string;
  accountId: string;
  refreshToken: string | null;
  accessToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  userId: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface VerificationTable {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
}
