import { auth } from 'app:route/api/auth';
import { Hono } from 'hono';

const api = new Hono().route('/auth', auth);

export { api };
