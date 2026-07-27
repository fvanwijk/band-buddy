import type { FC, ReactNode } from 'react';

type FeatureCardProps = {
  description: ReactNode;
  icon: ReactNode;
  title: string;
};

export const FeatureCard: FC<FeatureCardProps> = ({ description, icon, title }) => (
  <div className="rounded-2xl bg-slate-900/60 p-6">
    <div className="mb-4 h-6 w-6 text-brand-300">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
    <p className="mt-2 text-sm text-slate-400">{description}</p>
  </div>
);
