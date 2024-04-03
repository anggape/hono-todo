import { database } from 'app:database/connection';
import { tokensTable, usersTable } from 'app:database/schema';
import { HttpError, e } from 'app:types';
import { eq } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';

// TODO: verify expiresAt

const authenticated = createMiddleware<{
  Variables: {
    user: typeof usersTable.$inferSelect;
    token: typeof tokensTable.$inferSelect;
  };
}>(async (ctx, next) => {
  const [, bearer] = (ctx.req.header('authorization') ?? ' ').split(' ');
  if (!bearer) {
    throw new HttpError(401, e('auth', 'unauthorized'));
  }

  const token = await database.query.tokensTable.findFirst({
    where: eq(tokensTable.token, bearer),
  });
  if (!token) {
    throw new HttpError(401, e('auth', 'unauthorized'));
  }

  const user = await database.query.usersTable.findFirst({
    where: eq(usersTable.id, token?.userId ?? -1),
  });
  if (!user) {
    throw new HttpError(401, e('auth', 'unauthorized'));
  }

  ctx.set('token', token);
  ctx.set('user', user);
  await next();
});

export { authenticated };
