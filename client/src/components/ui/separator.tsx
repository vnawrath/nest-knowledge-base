import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Separator({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('manuscript-rule', className)} {...props} />;
}
