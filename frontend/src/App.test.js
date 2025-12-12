import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AI Fraud Detection Dashboard', () => {
  render(<App />);
  const headingElement = screen.getByText(/AI Fraud Detection Dashboard/i);
  expect(headingElement).toBeInTheDocument();
});
