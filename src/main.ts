import { server } from 'app:config/server';
import { migrate } from 'app:database/connection';
import { errorHandler, notFound } from 'app:helper/error-handler';
import { api } from 'app:route/api';
import { web } from 'app:route/web';
import { serve } from 'bun';
import { Hono } from 'hono';

migrate()
  .then(() => {
    const app = new Hono()
      .notFound(notFound)
      .onError(errorHandler)
      .route('/', web)
      .route('/api', api);
    serve({ ...app, ...server });
  })
  .catch((reason) => {
    console.log(reason);
  });
