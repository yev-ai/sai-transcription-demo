import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';

export function LoginButton() {
  const { status } = useSession();
  return (
    <Button
      variant={status === 'authenticated' ? 'destructive' : 'default'}
      onClick={status === 'authenticated' ? () => signOut() : () => signIn()}
      className="text-base flex items-center justify-center motion-preset-shake"
      style={{ backgroundColor: '#26241E', color: '#FFFFFF' }}
    >
      {status === 'loading' ? 'Loading' : status === 'authenticated' ? 'Log Out' : 'Log In'}
    </Button>
  );
}
