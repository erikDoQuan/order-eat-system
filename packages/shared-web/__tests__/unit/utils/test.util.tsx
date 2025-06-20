import type { RenderOptions } from '@testing-library/react';
import type { FC, ReactElement, ReactNode } from 'react';
import React from 'react';
import { render } from '@testing-library/react';

type AllTheProvidersProps = {
  children: ReactNode;
};

export const AllTheProviders: FC<AllTheProvidersProps> = ({ children }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';

export { customRender as render };
