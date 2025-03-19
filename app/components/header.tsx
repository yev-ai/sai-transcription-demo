'use client';

import { useSession } from 'next-auth/react';
import { LoginButton } from './login-button';

export function Header() {
  const { status: authStatus } = useSession();
  const isLoggedIn = authStatus === 'authenticated';
  return (
    <div>
      <LoginButton />
    </div>
  );
}
