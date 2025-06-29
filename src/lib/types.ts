import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "kysely";
import {
  UserTable,
  SessionTable,
  AccountTable,
  VerificationTable,
} from "./typesAuth";

export interface DB {
  memes: MemeTable;
  likes: LikesTable;
  user: UserTable;
  session: SessionTable;
  account: AccountTable;
  verification: VerificationTable;
}

export interface MemeTable {
  id: Generated<number>;
  image_data: Buffer;
  ocr_text: string;
  user_id: string | null;
  created_at: Generated<Date>;
}

export interface LikesTable {
  user_id: string;
  meme_id: number;
  created_at: Generated<Date>;
}

export interface ClientMeme {
  id: number;
  image_data: string;
  ocr_text: string;
  user_id: string | null;
  created_at: Date;
  like_count: number;
  is_liked: boolean;
}

export type Meme = Selectable<MemeTable>;
export type NewMeme = Insertable<MemeTable>;
export type MemeUpdate = Updateable<MemeTable>;

export type Like = Selectable<LikesTable>;
export type NewLike = Insertable<LikesTable>;

export type User = Selectable<UserTable>;