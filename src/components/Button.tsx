import { type VariantProps, cva } from 'class-variance-authority';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

const buttonVariants = cva(
  'inline-flex rounded-full items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50',
  {
    compoundVariants: [
      // Filled variants
      {
        className: 'bg-slate-700 text-slate-300 hover:bg-slate-600',
        color: 'default',
        variant: 'filled',
      },
      {
        className: 'bg-brand-500 text-white hover:bg-brand-600',
        color: 'primary',
        variant: 'filled',
      },
      {
        className: 'bg-red-500 text-white hover:bg-red-600',
        color: 'danger',
        variant: 'filled',
      },
      // Ghost variants
      {
        className: 'text-slate-300 hover:text-slate-100',
        color: 'default',
        variant: 'ghost',
      },
      {
        className: 'text-brand-300 hover:text-brand-400',
        color: 'primary',
        variant: 'ghost',
      },
      {
        className: 'text-red-400 hover:text-red-300',
        color: 'danger',
        variant: 'ghost',
      },
      // Outlined variants
      {
        className: 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500',
        color: 'default',
        variant: 'outlined',
      },
      {
        className: 'border-brand-400/30 bg-brand-400/10 text-brand-200 hover:bg-brand-400/20',
        color: 'primary',
        variant: 'outlined',
      },
      {
        className: 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
        color: 'danger',
        variant: 'outlined',
      },
    ],
    defaultVariants: {
      color: 'default',
      icon: false,
      size: 'default',
      variant: 'filled',
    },
    variants: {
      color: {
        danger: '',
        default: '',
        primary: '',
      },
      icon: {
        false: '',
        true: 'pl-2! pr-2!',
      },
      size: {
        default: 'px-3 py-1 text-sm',
        icon: 'p-1.5',
      },
      variant: {
        filled: 'text-xs font-semibold uppercase tracking-[0.25em]',
        ghost: 'bg-transparent hover:bg-opacity-10',
        outlined: 'border pl-4 pr-3 py-2 text-xs font-semibold uppercase tracking-[0.25em]',
      },
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps<C extends ElementType> = {
  as?: C;
  iconEnd?: ReactNode;
  iconStart?: ReactNode;
} & ButtonVariants &
  ComponentPropsWithoutRef<C>;

export function Button<C extends ElementType = 'button'>({
  as,
  children,
  className = '',
  color,
  icon = false,
  iconEnd,
  iconStart,
  size,
  variant,
  ...props
}: ButtonProps<C>) {
  const Component = as || 'button';
  const hasIcons = iconStart || iconEnd;
  const gapClass = hasIcons ? 'gap-2' : '';

  return (
    <Component
      className={buttonVariants({
        className: `${gapClass} ${className}`,
        color,
        icon,
        size,
        variant,
      })}
      {...props}
    >
      {iconStart}
      {children}
      {iconEnd}
    </Component>
  );
}
