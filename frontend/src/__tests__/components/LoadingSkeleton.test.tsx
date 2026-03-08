import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders table skeleton by default', () => {
    const { container } = render(<LoadingSkeleton />);
    // Table has a header row with border-b and multiple skeleton rows
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    expect(container.querySelector('.border-b')).toBeTruthy();
  });

  it('renders card skeleton', () => {
    const { container } = render(<LoadingSkeleton type="card" />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    // Card renders items with shadow-sm class
    expect(container.querySelector('.shadow-sm')).toBeTruthy();
  });

  it('renders stat skeleton with grid layout', () => {
    const { container } = render(<LoadingSkeleton type="stat" />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
    expect(grid?.classList.contains('animate-pulse')).toBe(true);
  });

  it('renders chart skeleton', () => {
    const { container } = render(<LoadingSkeleton type="chart" />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    // Chart has a height-64 area for bars
    expect(container.querySelector('.h-64')).toBeTruthy();
  });

  it('renders list skeleton', () => {
    const { container } = render(<LoadingSkeleton type="list" />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    // List items have rounded-full avatar
    expect(container.querySelector('.rounded-full')).toBeTruthy();
  });

  it('respects custom rows prop for table type', () => {
    const { container } = render(<LoadingSkeleton type="table" rows={3} />);
    // The table has 1 header + 3 row divs. Rows are direct children after the header.
    const pulse = container.querySelector('.animate-pulse');
    // Header is 1 div with border-b, then 3 row divs
    const children = pulse?.children;
    // 1 header + 3 rows = 4
    expect(children?.length).toBe(4);
  });

  it('respects custom rows prop for list type', () => {
    const { container } = render(<LoadingSkeleton type="list" rows={2} />);
    const pulse = container.querySelector('.animate-pulse');
    expect(pulse?.children.length).toBe(2);
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSkeleton className="my-custom-class" />);
    expect(container.querySelector('.my-custom-class')).toBeTruthy();
  });
});
