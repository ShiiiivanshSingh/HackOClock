/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export type ColorScheme = 'light' | 'dark';

const tintColorLight = '#0A7EA4';
const tintColorDark = '#29b6f6';

export default {
  light: {
    text: '#000',
    background: '#f5f5f5',
    tint: tintColorLight,
    icon: '#111',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    cardBackground: '#ffffff',
    borderColor: '#e0e0e0',
  },
  dark: {
    text: '#fff',
    background: '#121212',
    tint: tintColorDark,
    icon: '#fff',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    cardBackground: '#1e1e1e',
    borderColor: '#2c2c2c',
  },
};
