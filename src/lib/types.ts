import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely'

export interface DB {
  memes: MemeTable
}

export interface MemeTable {
  id: Generated<number>
  image_type: string
  image_data: Uint8Array | Buffer
  ocr_text: string
  created_at: Generated<Date>
}

export type Meme = Selectable<MemeTable>
export type NewMeme = Insertable<MemeTable>
export type MemeUpdate = Updateable<MemeTable>