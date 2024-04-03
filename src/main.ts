import { server } from 'app:config/server';
import { errorHandler, notFound } from 'app:helper/error-handler';
import { api } from 'app:route/api';
import { web } from 'app:route/web';
import { Hono } from 'hono';

const app = new Hono()
  .notFound(notFound)
  .onError(errorHandler)
  .route('/', web)
  .route('/api', api);

export default {
  ...app,
  ...server,
};
