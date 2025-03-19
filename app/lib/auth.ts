import { AuthRole } from '@types';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const users = {
  doc: { id: '1', role: AuthRole.doctor, password: 'pass' },
  assistant: { id: '2', role: AuthRole.assistant, password: 'pass' },
  patient: { id: '3', role: AuthRole.patient, password: 'pass' },
  patient2: { id: '4', role: AuthRole.patient, password: 'pass' },
} as const;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user =
          typeof credentials?.username === 'string' &&
          credentials.username in users &&
          credentials.password === users[credentials.username as keyof typeof users].password
            ? users[credentials.username as keyof typeof users]
            : null;
        return user;
      },
    }),
  ],
});
