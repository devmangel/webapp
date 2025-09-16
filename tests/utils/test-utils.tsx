import type { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Extend this wrapper with shared providers (Intl, Theme, QueryClient, etc.) as the app grows.
const AllProviders = ({ children }: { children: ReactNode }) => <>{children}</>;

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>;

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {},
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
