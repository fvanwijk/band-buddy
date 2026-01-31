import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type ButtonVariant =
  | 'danger'
  | 'default'
  | 'ghost'
  | 'icon-danger'
  | 'icon-primary'
  | 'outline'
  | 'primary'
  | 'secondary'
  | 'toggle';

type ButtonProps<C extends ElementType> = {
  as?: C;
  children: ReactNode;
  variant?: ButtonVariant;
} & ComponentPropsWithoutRef<C>;

const variantStyles: Record<ButtonVariant, string> = {
  danger: 'rounded bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600',
  default:
    'rounded bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600',
  ghost:
    'font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400',
  'icon-danger':
    'rounded-md border border-red-500/20 bg-red-500/5 p-1.5 text-red-400 transition-all hover:bg-red-500/15',
  'icon-primary':
    'rounded-md border border-brand-400/20 bg-brand-400/5 p-1.5 text-brand-300 transition-all hover:bg-brand-400/15',
  outline:
    'rounded border border-dashed border-brand-300 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-600 hover:border-brand-400 hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-400 dark:hover:bg-brand-900',
  primary:
    'rounded bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950',
  secondary:
    'text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
  toggle: '',
};

export function Button<C extends ElementType = 'button'>({
  as,
  children,
  className = '',
  variant = 'default',
  ...props
}: ButtonProps<C>) {
  const Component = as || 'button';
  const baseClassName = variantStyles[variant];

  return (
    <Component className={`${baseClassName} ${className}`} {...props}>
      {children}
    </Component>
  );
}
