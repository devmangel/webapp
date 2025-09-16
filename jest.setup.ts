import '@testing-library/jest-dom';
import type { ReactNode } from 'react';

// Provide a default mocked router for components relying on App Router hooks.
const mockRouter = () => ({
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  push: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
});

jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    usePathname: () => '/',
    useRouter: () => mockRouter(),
    useSearchParams: () => new URLSearchParams(),
  };
});

jest.mock('next-intl', () => {
  const actual = jest.requireActual('next-intl');
  return {
    ...actual,
    useTranslations: () => (key: string) => key,
    NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
  };
});

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: () => ({ data: null, status: 'unauthenticated' as const }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});
