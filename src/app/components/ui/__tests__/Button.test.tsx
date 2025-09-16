import { Button } from 'components/ui/Button';
import { render, screen } from 'test-utils';

describe('Button', () => {
  it('renders children and default variant styles', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('px-4');
  });

  it('supports outlined secondary variant', () => {
    render(
      <Button variant="outlined" color="secondary">
        Outline
      </Button>,
    );

    const button = screen.getByRole('button', { name: /outline/i });

    expect(button).toHaveClass('border-secondary');
    expect(button).toHaveClass('text-secondary');
  });
});
