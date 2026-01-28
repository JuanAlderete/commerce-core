import { db } from '../../shared/db/index.js';
import { NewCategory, Category } from './categories.schema.js';

export class CategoryRepository {
  async create(category: NewCategory): Promise<Category> {
    return await db
      .insertInto('categories')
      .values(category)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findAll(): Promise<Category[]> {
    return await db.selectFrom('categories').selectAll().execute();
  }

  async findBySlug(slug: string): Promise<Category | undefined> {
    return await db
      .selectFrom('categories')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();
  }

  async findById(id: string): Promise<Category | undefined> {
    return await db
      .selectFrom('categories')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }
}

export const categoryRepository = new CategoryRepository();