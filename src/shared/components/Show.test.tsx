import { render, screen } from '@testing-library/react';

import { Show } from './Show';

describe('Show', () => {
  it('renders children when "when" is true', () => {
    render(<Show when={true}>visible content</Show>);
    expect(screen.getByText('visible content')).toBeInTheDocument();
  });

  it('renders nothing when "when" is false and no fallback', () => {
    const { container } = render(<Show when={false}>hidden content</Show>);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders fallback when "when" is false', () => {
    render(
      <Show when={false} fallback={<span>fallback content</span>}>
        hidden content
      </Show>
    );
    expect(screen.getByText('fallback content')).toBeInTheDocument();
    expect(screen.queryByText('hidden content')).not.toBeInTheDocument();
  });

  it('renders children and not fallback when "when" is true', () => {
    render(
      <Show when={true} fallback={<span>fallback</span>}>
        visible
      </Show>
    );
    expect(screen.getByText('visible')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });
});
