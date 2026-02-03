import { IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type AlertSeverity = 'error' | 'info' | 'neutral' | 'success' | 'warning';

type AlertProps = {
  children: ReactNode;
  hasIcon?: boolean;
  icon?: ReactNode;
  severity?: AlertSeverity;
};

const alertStyles: Record<AlertSeverity, string> = {
  error: 'border-red-400/30 bg-red-500/10 text-red-200',
  info: 'border-sky-400/30 bg-sky-500/10 text-sky-200',
  neutral: 'border-slate-700 bg-slate-900/40 text-slate-300',
  success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
};

const defaultIcons: Record<AlertSeverity, ReactNode> = {
  error: <IconX className="h-4 w-4" />,
  info: <IconInfoCircle className="h-4 w-4" />,
  neutral: <IconInfoCircle className="h-4 w-4" />,
  success: <IconCircleCheck className="h-4 w-4" />,
  warning: <IconAlertTriangle className="h-4 w-4" />,
};

export function Alert({ children, hasIcon = true, icon, severity = 'neutral' }: AlertProps) {
  return (
    <div
      className={[
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-xs',
        alertStyles[severity],
      ].join(' ')}
    >
      {hasIcon && <span className="mt-0.5">{icon || defaultIcons[severity]}</span>}
      <span>{children}</span>
    </div>
  );
}
