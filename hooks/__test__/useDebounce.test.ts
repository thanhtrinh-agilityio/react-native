import { act, renderHook } from '@testing-library/react-native';

import useDebounce from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce hook', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('updates debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 300 } },
    );

    expect(result.current).toBe('first');

    rerender({ value: 'second', delay: 300 });

    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('second');
  });

  it('resets timer if value changes within delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'start', delay: 500 } },
    );

    expect(result.current).toBe('start');

    rerender({ value: 'change1', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    rerender({ value: 'change2', delay: 500 });

    expect(result.current).toBe('start');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('start');

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('change2');
  });
});
