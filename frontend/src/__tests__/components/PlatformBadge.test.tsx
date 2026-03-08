import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlatformBadge, getPlatformLabel } from '@/components/ui/PlatformBadge';

describe('PlatformBadge', () => {
  it('renders Smartlead badge with correct label and colors', () => {
    render(<PlatformBadge platform="smartlead" />);
    const badge = screen.getByText('Smartlead');
    expect(badge).toBeInTheDocument();
    expect(badge.style.color).toBe('rgb(37, 99, 235)'); // #2563EB
  });

  it('renders EmailBison badge', () => {
    render(<PlatformBadge platform="emailbison" />);
    expect(screen.getByText('EmailBison')).toBeInTheDocument();
  });

  it('renders Instantly badge', () => {
    render(<PlatformBadge platform="instantly" />);
    expect(screen.getByText('Instantly')).toBeInTheDocument();
  });

  it('renders Reply.io badge', () => {
    render(<PlatformBadge platform="replyio" />);
    expect(screen.getByText('Reply.io')).toBeInTheDocument();
  });

  it('renders unknown platform with raw name as label', () => {
    render(<PlatformBadge platform="newplatform" />);
    expect(screen.getByText('newplatform')).toBeInTheDocument();
  });

  it('applies uppercase text transform', () => {
    render(<PlatformBadge platform="smartlead" />);
    const badge = screen.getByText('Smartlead');
    expect(badge.style.textTransform).toBe('uppercase');
  });
});

describe('getPlatformLabel', () => {
  it('returns label for known platform', () => {
    expect(getPlatformLabel('smartlead')).toBe('Smartlead');
    expect(getPlatformLabel('emailbison')).toBe('EmailBison');
    expect(getPlatformLabel('instantly')).toBe('Instantly');
    expect(getPlatformLabel('replyio')).toBe('Reply.io');
  });

  it('returns raw string for unknown platform', () => {
    expect(getPlatformLabel('custom')).toBe('custom');
  });

  it('returns fallback for null/undefined', () => {
    expect(getPlatformLabel(null)).toBe('your email platform');
    expect(getPlatformLabel(undefined)).toBe('your email platform');
  });
});
