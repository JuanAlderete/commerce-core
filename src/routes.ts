import { FastifyInstance } from 'fastify';
import { healthRoutes } from './modules/health/health.routes.js';
import { userRoutes } from './modules/users/users.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { categoryRoutes } from './modules/categories/categories.routes.js';
import { productRoutes } from './modules/products/products.routes.js';
import { orderRoutes } from './modules/orders/orders.routes.js';
import { paymentRoutes } from './modules/payments/payments.routes.js';

export async function appRoutes(app: FastifyInstance) {
  app.register(healthRoutes, { prefix: '/health' });
  app.register(userRoutes, { prefix: '/users' });
  app.register(authRoutes, { prefix: '/auth' });
  app.register(categoryRoutes, { prefix: '/categories' });
  app.register(productRoutes, { prefix: '/products' });
  app.register(orderRoutes, { prefix: '/orders' });
  app.register(paymentRoutes, { prefix: '/payments' });

  app.get('/', async () => {
    return { message: 'Commerce Core API Running 🚀' };
  });
}