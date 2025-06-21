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
  image_data: Buffer
  ocr_text: string
  created_at: Generated<Date>
}

export interface ClientMeme {
  id: number
  image_data: string
  ocr_text: string
  created_at: Date
}

export type Meme = Selectable<MemeTable>
export type NewMeme = Insertable<MemeTable>
export type MemeUpdate = Updateable<MemeTable>