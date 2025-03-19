'use client';

import ThreeDotsWave from '@/components/ui/three-dots-wave';
import { cn } from '@/lib/utils';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { Conversation } from '@types';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Root ref={ref} className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
  )
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn('aspect-square h-full w-full', className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

function shouldDisplayMessage(msg: Conversation): boolean {
  const { role, text, status, isFinal } = msg;

  if (role === 'assistant') {
    return true;
  } else {
    if (status === 'speaking' || status === 'processing') {
      return true;
    }
    if (isFinal && text.trim().length > 0) {
      return true;
    }
    return false;
  }
}

function ConversationItem({ message }: { message: Conversation }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const msgStatus = message.status;

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}
    >
      {isAssistant && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}

      <div
        className={`${
          isUser ? 'bg-primary text-background' : 'bg-secondary dark:text-foreground'
        } px-4 py-2 rounded-lg max-w-[70%] motion-preset-slide-up-right`}
      >
        {(isUser && msgStatus === 'speaking') || msgStatus === 'processing' ? <ThreeDotsWave /> : <p>{message.text}</p>}

        <div className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
          })}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

interface TranscriberProps {
  conversation: Conversation[];
}

export default function Transcriber({ conversation }: TranscriberProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  const displayableMessages = React.useMemo(() => {
    return conversation.filter(shouldDisplayMessage);
  }, [conversation]);

  return (
    <div className="flex flex-col w-full h-full mx-auto bg-background rounded-lg shadow-lg overflow-hidden dark:bg-background">
      <div className="bg-secondary px-4 py-3 flex items-center justify-between dark:bg-secondary">
        <div className="font-medium text-foreground dark:text-foreground">Live Transcript</div>
      </div>

      <div ref={scrollRef} className="flex-1 h-full overflow-y-auto p-4 space-y-4 z-50 scrollbar-thin scrollbar-thumb-primary">
        <AnimatePresence>
          {displayableMessages.map(message => (
            <ConversationItem key={message.id} message={message} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export { Avatar, AvatarFallback, AvatarImage };
