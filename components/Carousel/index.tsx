import React, { memo, ReactElement, Ref } from 'react';
import { ViewStyle } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

// Types
import { SlideItem } from '@/types';

interface MemoCarouselProps {
  carouselRef: Ref<null>;
  carouselWidth: number;
  data: SlideItem[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  renderSlide: ({
    item,
    index,
  }: {
    item: SlideItem;
    index: number;
  }) => ReactElement;
  style?: ViewStyle;
}

const CarouselComponent = ({
  carouselRef,
  carouselWidth,
  data,
  setCurrentIndex,
  renderSlide,
  style,
}: MemoCarouselProps) => {
  return (
    <Carousel
      ref={carouselRef}
      width={carouselWidth}
      data={data}
      autoPlay
      loop
      scrollAnimationDuration={2000}
      onSnapToItem={setCurrentIndex}
      renderItem={({ item, index }) => renderSlide({ item, index })}
      style={style}
    />
  );
};

export const Carousels = memo(CarouselComponent);
