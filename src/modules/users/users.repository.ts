import { db } from '../../shared/db/index.js';
import { NewUser, User, UserUpdate } from './users.schema.js';

export class UserRepository {
  async create(user: NewUser): Promise<User> {
    return await db
      .insertInto('users')
      .values(user)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();
  }

  async findById(id: string): Promise<User | undefined> {
    return await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findAll(): Promise<User[]> {
    return await db.selectFrom('users').selectAll().execute();
  }

  async update(id: string, user: UserUpdate): Promise<User> {
    return await db
      .updateTable('users')
      .set(user)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string): Promise<void> {
    await db.deleteFrom('users').where('id', '=', id).executeTakeFirstOrThrow();
  }
}

export const userRepository = new UserRepository();