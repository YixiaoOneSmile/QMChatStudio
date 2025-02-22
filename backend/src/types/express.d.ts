import { User } from './user';

declare namespace Express {
  export interface Request {
    user: {
      id: number;
      username: string;
    };
  }
}

export {} 