import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { BaseButton } from '../index';

describe(' Button Component', () => {
  it('renders with title and icon', () => {
    const { getByLabelText } = render(
      <BaseButton title="Submit" iconName="send" />,
    );

    expect(getByLabelText('Submit')).toBeTruthy();
  });

  it('fires onPress callback', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <BaseButton title="Tap me" onPress={onPress} testID="button" />,
    );

    fireEvent.press(getByTestId('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omits the icon if iconName is not provided', () => {
    const { queryByTestId } = render(<BaseButton title="No icon" />);
    expect(queryByTestId('icon')).toBeNull();
  });
});
