import { FastifyReply, FastifyRequest } from 'fastify';
import { categoryRepository } from './categories.repository.js';
import { CreateCategoryBody } from './categories.dto.js';

export class CategoryController {
    async create(request: FastifyRequest<{ Body: CreateCategoryBody }>, reply: FastifyReply) {
        const { name, slug, description, parentId } = request.body;

        try {
            const category = await categoryRepository.create({
                name,
                slug,
                description: description || null,
                parent_id: parentId || null
            });

            return reply.status(201).send(category);
        } catch (error: any) {
            // Manejo básico de duplicados (Postgres error 23505)
            if (error.code === '23505') {
                return reply.status(409).send({ error: 'Slug already exists' });
            }
            throw error;
        }
    }

    async list(request: FastifyRequest, reply: FastifyReply) {
        const categories = await categoryRepository.findAll();
        return reply.send(categories);
    }
}

export const categoryController = new CategoryController();