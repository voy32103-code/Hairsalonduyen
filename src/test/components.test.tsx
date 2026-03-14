import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/ui/PageHeader';
import React from 'react';

describe('PageHeader Component', () => {
  it('renders the title and description correctly', () => {
    render(
      React.createElement(PageHeader, {
        title: "Test Title",
        description: "Test Description"
      })
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders breadcrumbs when provided', () => {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Dashboard' }
    ];
    
    render(
      React.createElement(PageHeader, {
        title: "Test Title",
        breadcrumbItems: breadcrumbs
      })
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
