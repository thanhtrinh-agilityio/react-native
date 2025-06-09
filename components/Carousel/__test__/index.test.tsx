import { MOCK_DATA_CAROUSEL } from '@/mocks';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Carousels } from '../index';

describe('Carousels Component', () => {
  const renderSlide = ({ item }: any) => <Text>{item.title}</Text>;
  const mockSetCurrentIndex = jest.fn();
  const carouselRef = React.createRef<null>();

  it('renders all carousel slides correctly', () => {
    const { getByText } = render(
      <Carousels
        carouselRef={carouselRef}
        carouselWidth={300}
        data={MOCK_DATA_CAROUSEL}
        currentIndex={0}
        setCurrentIndex={mockSetCurrentIndex}
        renderSlide={renderSlide}
      />,
    );

    expect(getByText('Slide 1')).toBeTruthy();
    expect(getByText('Slide 2')).toBeTruthy();
  });

  it('calls setCurrentIndex on snap', () => {
    const { UNSAFE_getByType } = render(
      <Carousels
        carouselRef={carouselRef}
        carouselWidth={300}
        data={MOCK_DATA_CAROUSEL}
        currentIndex={0}
        setCurrentIndex={mockSetCurrentIndex}
        renderSlide={renderSlide}
      />,
    );

    const carouselInstance = UNSAFE_getByType(
      require('react-native-reanimated-carousel').default,
    );

    // simulate snap to second item
    carouselInstance.props.onSnapToItem(1);

    expect(mockSetCurrentIndex).toHaveBeenCalledWith(1);
  });
});
