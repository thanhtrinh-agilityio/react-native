import React from 'react';

import { render } from '@testing-library/react-native';

// Context
import { useLoading } from '@/contexts/LoadingContext';

// Components
import LoadingOverlay from '../index';

// 1️⃣  Stub the hook that the component relies on
jest.mock('@/contexts/LoadingContext', () => ({
  useLoading: jest.fn(),
}));

// A tiny helper to set the desired hook result per test
const mockUseLoading = (value: boolean) => {
  (useLoading as jest.Mock).mockReturnValue({ isLoading: value });
};

describe('Loading Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when both “visible” and context.isLoading are false', () => {
    mockUseLoading(false);

    const { queryByText } = render(<LoadingOverlay />);
    expect(queryByText('Loading...')).toBeNull();
  });

  it('shows spinner and default text when “visible” prop is true', () => {
    mockUseLoading(false);

    const { getByText, getByTestId } = render(<LoadingOverlay visible />);

    expect(getByText('Loading...')).toBeTruthy();
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('shows spinner and custom text when a custom message is passed', () => {
    mockUseLoading(false);

    const { getByText } = render(<LoadingOverlay visible text="Please wait" />);
    expect(getByText('Please wait')).toBeTruthy();
  });

  it('shows spinner when context isLoading is true, even if “visible” is false', () => {
    mockUseLoading(true);

    const { getByText } = render(<LoadingOverlay />);

    expect(getByText('Loading...')).toBeTruthy();
  });
});
