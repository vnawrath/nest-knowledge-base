import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90',
        secondary:
          'border-border bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border-border bg-card px-4 py-2 text-foreground hover:bg-secondary/60',
        ghost:
          'border-transparent px-3 py-2 text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
        warning:
          'border-warning bg-warning px-4 py-2 text-primary-foreground hover:opacity-90',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-5 text-base',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  asChild,
  className,
  size,
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  );
}

export { buttonVariants };
