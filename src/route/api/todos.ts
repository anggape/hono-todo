import { database } from 'app:database/connection';
import { todosTable } from 'app:database/schema';
import { authenticated } from 'app:middleware/authenticated';
import { validate } from 'app:middleware/validate';
import { HttpError, e } from 'app:types';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

const createSchema = z.object({
  todo: z.string(),
});
const updateSchema = z.object({
  todo: z.string().optional(),
});
const paramSchema = z.object({
  id: z.coerce.number(),
});

const todos = new Hono()
  .use(authenticated)
  .get('/', async (ctx) => {
    const user = ctx.get('user');
    return ctx.json(
      await database.query.todosTable.findMany({
        where: eq(todosTable.userId, user.id),
      }),
    );
  })
  .get('/:id', validate('param', paramSchema), async (ctx) => {
    const { id } = ctx.req.valid('param');
    const user = ctx.get('user');
    const todo = await database.query.todosTable.findFirst({
      where: and(eq(todosTable.userId, user.id), eq(todosTable.id, id)),
    });
    if (!todo) {
      throw new HttpError(404, e('id', 'not_found'));
    }
    return ctx.json(todo);
  })
  .delete('/:id', validate('param', paramSchema), async (ctx) => {
    const { id } = ctx.req.valid('param');
    const user = ctx.get('user');
    const [todo] = await database
      .delete(todosTable)
      .where(and(eq(todosTable.userId, user.id), eq(todosTable.id, id)))
      .returning();
    if (!todo) {
      throw new HttpError(404, e('id', 'not_found'));
    }
    return ctx.json(todo);
  })
  .patch(
    '/:id',
    validate('param', paramSchema),
    validate('json', updateSchema),
    async (ctx) => {
      const { id } = ctx.req.valid('param');
      const user = ctx.get('user');
      const [todo] = await database
        .update(todosTable)
        .set({ ...ctx.req.valid('json') })
        .where(and(eq(todosTable.userId, user.id), eq(todosTable.id, id)))
        .returning();
      if (!todo) {
        throw new HttpError(404, e('id', 'not_found'));
      }
      return ctx.json(todo);
    },
  )
  .post('/', validate('json', createSchema), async (ctx) => {
    const user = ctx.get('user');
    const [todo] = await database
      .insert(todosTable)
      .values({ ...ctx.req.valid('json'), userId: user.id })
      .returning();
    return ctx.json(todo, 201);
  });

export { todos };
