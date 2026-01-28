import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface CategoryTable {
  id: Generated<string>;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type Category = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;