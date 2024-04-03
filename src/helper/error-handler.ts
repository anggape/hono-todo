import { HttpError, e } from 'app:types';
import { Context, ErrorHandler } from 'hono';

const notFound = (ctx: Context) => {
  throw new HttpError(404, e('page', 'not_found'));
};

const errorHandler: ErrorHandler = async (error: Error, ctx: Context) => {
  if (error instanceof HttpError) {
    return ctx.json({ errors: error.errors }, error.statusCode);
  }
  return ctx.json(
    {
      errors: { server: 'internal_error' },
      error,
    },
    500,
  );
};

export { notFound, errorHandler };
