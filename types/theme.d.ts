// theme.d.ts
import '@rneui/themed';

declare module '@rneui/themed' {
  export interface Colors {
    borderInput?: string;
    textInput?: string;
    backgroundButtonContainer?: string;
    borderButtonContainer?: string;
    borderDrawer?: string;
    backgroundLogoutButton?: string;
    borderLogoutButton?: string;
    colorLogoutButton?: string;
    backgroundCode?: string;
    tint?: string;
    text?: string;
  }
}
