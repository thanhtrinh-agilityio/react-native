import { Colors } from '@/constants/Colors';
import { createTheme } from '@rneui/themed';

export const theme = createTheme({
  lightColors: Colors.light,
  darkColors: Colors.dark,
  components: {
    Button: {
      raised: false,
    },
  },
});
