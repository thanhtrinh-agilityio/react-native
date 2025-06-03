import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { BaseButton } from '../index';

describe('BaseButton with mocked useTheme', () => {
  it('renders and fires onPress', () => {
    const onPressMock = jest.fn();

    const { getByLabelText } = render(
      <BaseButton title="Click me" onPress={onPressMock} />,
    );

    const button = getByLabelText('Click me');
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders icon when iconName is provided', () => {
    const { queryByTestId } = render(
      <BaseButton title="Icon button" iconName="home" />,
    );
    expect(queryByTestId('icon')).toBeNull();
  });
});
