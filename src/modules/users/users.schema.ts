import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface UserTable {
  id: Generated<string>; // 'Generated' porque la DB lo crea (uuid)
  email: string;
  password_hash: string;
  full_name: string;
  role: Generated<string>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  is_guest: boolean;
}

// Tipos auxiliares para usar en el código
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;