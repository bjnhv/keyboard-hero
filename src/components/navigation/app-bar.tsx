'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Keyboard, Sparkles, Gamepad2, LucideIcon } from 'lucide-react';

export interface AppBarProps {
  children?: React.ReactNode;
  subTitle?: string;
  subIcon?: React.ReactNode;
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  activeColor: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/learn', label: 'Practice', icon: Keyboard, activeColor: 'text-primary' },
  { href: '/stats', label: 'Heatmap', icon: Sparkles, activeColor: 'text-primary' },
  { href: '/arcade', label: 'Arcade', icon: Gamepad2, activeColor: 'text-rose-400' },
];

export const AppBar: React.FC<AppBarProps> = ({
  children,
  subTitle,
  subIcon,
  className = '',
}) => {
  const pathname = usePathname();

  return (
    <header
      className={`flex items-center justify-between w-full border-b border-border/50 pb-2 mb-1.5 sm:pb-2.5 sm:mb-2 shrink-0 ${className}`}
    >
      {/* Left Navigation Bar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Home</span>
        </Link>

        <span className="text-border">/</span>

        {/* Dynamic Route Links with Disabled State when Active */}
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href;
          const isSubActive = pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <React.Fragment key={item.href}>
              {idx > 0 && <span className="text-border">/</span>}
              <Link
                href={item.href}
                aria-disabled={isActive}
                tabIndex={isActive ? -1 : undefined}
                onClick={(e) => {
                  if (isActive) e.preventDefault();
                }}
                className={`inline-flex items-center gap-1.5 text-xs transition font-medium ${
                  isActive
                    ? `pointer-events-none text-foreground font-bold cursor-default ${item.activeColor}`
                    : isSubActive
                    ? 'text-muted-foreground hover:text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? item.activeColor : ''
                  }`}
                />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </React.Fragment>
          );
        })}

        {/* Nested Sub-route (e.g. Redline RPM or future mini-games) */}
        {subTitle && (
          <>
            <span className="text-border">/</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
              {subIcon}
              <span>{subTitle}</span>
            </span>
          </>
        )}
      </div>

      {/* Right Toolbar / Actions */}
      {children && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {children}
        </div>
      )}
    </header>
  );
};
