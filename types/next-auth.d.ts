import type { AuthRole } from '@types';
import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    role: AuthRole;
    roomId?: string;
  }

  interface Session {
    user: DefaultSession['user'] & {
      role: AuthRole;
      roomId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: AuthRole;
    roomId?: string;
  }
}
