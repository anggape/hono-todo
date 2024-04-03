import { auth } from 'app:route/api/auth';
import { todos } from 'app:route/api/todos';
import { Hono } from 'hono';

const api = new Hono().route('/auth', auth).route('/todos', todos);

export { api };
