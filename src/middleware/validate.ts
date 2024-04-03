import { HttpError, e } from 'app:types';
import { ValidationTargets } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';

const validate = <
  TTarget extends keyof ValidationTargets,
  TSchema extends z.ZodType,
>(
  target: TTarget,
  schema: TSchema,
) => {
  return validator(target, async (value, ctx) => {
    const result = await schema.safeParseAsync(value);
    if (!result.success) {
      throw new HttpError(
        400,
        result.error.issues.map((issue) =>
          e(issue.path[0].toString(), issue.code),
        ),
      );
    }
    return result.data as z.infer<TSchema>;
  });
};

export { validate };
