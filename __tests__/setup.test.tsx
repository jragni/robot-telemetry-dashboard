import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple test component to verify setup
const TestComponent = ({ message }: { message: string }) => (
  <div data-testid="test-component">{message}</div>
);

describe('Test Setup Verification', () => {
  it('should render test component correctly', () => {
    render(<TestComponent message="Hello Test" />);
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('should support basic assertions', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
    expect('hello').toContain('ell');
  });

  it('should have access to DOM testing utilities', () => {
    const element = document.createElement('div');
    element.textContent = 'Test Element';
    
    expect(element).toBeDefined();
    expect(element.textContent).toBe('Test Element');
  });
});