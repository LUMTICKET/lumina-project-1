/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/theme/tokens';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';

  return getColors(theme);
}
