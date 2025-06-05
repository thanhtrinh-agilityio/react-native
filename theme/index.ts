import { Colors } from '@/constants';
import { createTheme } from '@rneui/themed';

export const lightTheme = createTheme({
  lightColors: Colors.light,
  components: {
    Button: {
      raised: false,
    },
  },
});

export const darkTheme = createTheme({
  darkColors: Colors.dark,
  components: {
    Button: {
      raised: false,
    },
  },
});
