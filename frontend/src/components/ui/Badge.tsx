import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'todo' | 'progress' | 'review' | 'done' | 'danger' | 'warning' | 'purple' | 'outline';
  size?: 'xs' | 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-surface-elevated text-text-secondary border-border',
    todo: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    progress: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
    review: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    done: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    warning: 'bg-yellow-950/70 text-yellow-300 border-yellow-800/60',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
    outline: 'bg-transparent text-text-muted border-border hover:border-slate-600',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded leading-tight',
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border font-sans select-none tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
