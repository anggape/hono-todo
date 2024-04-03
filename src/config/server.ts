import { env } from 'process';

const server = {
  port: env.SERVER_PORT ?? 8000,
};

export { server };
