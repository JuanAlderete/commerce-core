import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ProductTable {
  id: Generated<string>;
  name: string;
  slug: string;
  description: string | null;
  price_amount: number; // Integer (centavos)
  currency: Generated<string>; // Default 'USD'
  stock: number;
  sku: string;
  image_url: string | null;
  category_id: string | null;
  active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type Product = Selectable<ProductTable>;
export type NewProduct = Insertable<ProductTable>;
export type ProductUpdate = Updateable<ProductTable>;