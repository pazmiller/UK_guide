import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    githubLogin?: string;
  }

  interface Session {
    user?: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    githubLogin?: string;
  }
}
