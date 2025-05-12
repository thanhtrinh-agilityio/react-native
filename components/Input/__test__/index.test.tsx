
import React from 'react';

import { TextInput } from '@/components/Input';
import { fireEvent, render } from '@testing-library/react-native';

describe('TextInput Component', () => {
  it('should render correctly with default props', () => {
    const { getByTestId } = render(<TextInput testID="text-input" />);
    const input = getByTestId('text-input');
    expect(input).toBeTruthy();
  });

  it('should change border color on focus', () => {
    const { getByTestId } = render(<TextInput testID="text-input" />);
    const input = getByTestId('text-input');
    fireEvent(input, 'focus');
    expect(input.props.inputContainerStyle[1].borderColor).toBe('#cccbfe')
  })

  it('should render with an error style when errorMessage is passed', () => {
    const { getByTestId } = render(<TextInput testID="text-input" errorMessage="This is an error" />);
    const input = getByTestId('text-input');
    expect(input.props.errorMessage).toBe('This is an error');
  });

});
