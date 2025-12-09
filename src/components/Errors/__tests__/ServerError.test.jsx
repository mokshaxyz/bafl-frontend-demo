import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ServerError from '../ServerError';

it('renders ServerError with 500 code', () => {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/500', state: { error: 'Test error' } }] }>
      <ServerError />
    </MemoryRouter>
  );
  expect(screen.getByText('500')).toBeInTheDocument();
  expect(screen.getByText(/Server error/i)).toBeInTheDocument();
  expect(screen.getByText(/Test error/)).toBeInTheDocument();
});
