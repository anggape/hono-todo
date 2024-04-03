import { StatusCode } from 'hono/utils/http-status';

type HttpErrorItem = {
  item: string;
  code: string;
};

class HttpError extends Error {
  statusCode: StatusCode;
  errors: HttpErrorItem[];

  constructor(statusCode: StatusCode, errors: HttpErrorItem | HttpErrorItem[]) {
    super();

    this.statusCode = statusCode;
    this.errors = errors instanceof Array ? errors : [errors];
  }
}

const e = (item: string, code: string) => ({ item, code });

export { HttpError, e };
