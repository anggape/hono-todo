import { database } from 'app:database/connection';
import { tokensTable, usersTable } from 'app:database/schema';
import { validate } from 'app:middleware/validate';
import { HttpError, e } from 'app:types';
import { password } from 'bun';
import { SQLiteError } from 'bun:sqlite';
import { randomBytes } from 'crypto';
import { add, formatISO } from 'date-fns';
import { eq } from 'drizzle-orm';
import { Context, Hono } from 'hono';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  username: z.string().trim().toLowerCase().min(3).max(16),
  password: z
    .string()
    .min(6)
    .max(32)
    .transform(async (pass) => await password.hash(pass)),
});

const loginSchema = z.object({
  identity: z
    .string()
    .trim()
    .toLowerCase()
    .transform(async (value) => {
      const { success: useEmail } = await z
        .string()
        .email()
        .safeParseAsync(value);
      return {
        value,
        useEmail,
      };
    }),
  password: z.string(),
});

const response = async (ctx: Context, user: typeof usersTable.$inferSelect) => {
  const [token] = await database
    .insert(tokensTable)
    .values({
      userId: user.id,
      token: randomBytes(32).toString('hex'),
      expiresAt: formatISO(add(Date.now(), { months: 1 })),
    })
    .returning();
  const { id, email, username } = user;
  const { token: key, expiresAt } = token;

  return ctx.json({
    user: { id, email, username },
    token: { key, expiresAt },
  });
};

const auth = new Hono()
  .post('/register', validate('json', registerSchema), async (ctx) => {
    try {
      const [user] = await database
        .insert(usersTable)
        .values({ ...ctx.req.valid('json') })
        .returning();
      return await response(ctx, user);
    } catch (error) {
      if (
        error instanceof SQLiteError &&
        error.code === 'SQLITE_CONSTRAINT_UNIQUE'
      ) {
        const column = error.message.split(' ').at(-1);
        switch (column) {
          case 'users.username':
            throw new HttpError(400, e('username', 'already_used'));
          case 'users.email':
            throw new HttpError(400, e('email', 'already_used'));
        }
      }
      throw error;
    }
  })
  .post('/login', validate('json', loginSchema), async (ctx) => {
    const { identity, password: pass } = ctx.req.valid('json');
    const user = await database.query.usersTable.findFirst({
      where: eq(
        identity.useEmail ? usersTable.email : usersTable.username,
        identity.value,
      ),
    });

    if (!user) {
      throw new HttpError(404, e('identity', 'not_found'));
    }
    if (!(await password.verify(pass, user.password))) {
      throw new HttpError(400, e('password', 'invalid'));
    }

    return await response(ctx, user);
  });

export { auth };
