import { colors } from '@/constants/colors';
import { createTheme } from '@rneui/themed';

export const lightTheme = createTheme({
  lightColors: colors.light,
  components: {
    Button: {
      raised: false,
    },
  },
});

export const darkTheme = createTheme({
  darkColors: colors.dark,
  components: {
    Button: {
      raised: false,
    },
  },
});
