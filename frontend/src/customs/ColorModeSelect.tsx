import { useColorScheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectProps } from '@mui/material/Select';

/**
 * A dropdown component that allows the user to switch the application's color theme.
 * Supports 'system', 'light', and 'dark' modes using Material UI's `useColorScheme`.
 */
export default function ColorModeSelect(props: SelectProps) {
  // Hook to access and update the current color scheme state.
  const { mode, setMode } = useColorScheme();

  // Return null if the mode is not yet defined to prevent hydration mismatches
  // or rendering before the theme context is ready.
  if (!mode) {
    return null;
  }

  return (
    <Select
      value={mode}
      onChange={(event) =>
        // Cast the string value to the specific union type expected by setMode.
        setMode(event.target.value as 'system' | 'light' | 'dark')
      }
      SelectDisplayProps={{
        // @ts-ignore: Adding a custom data attribute for testing/screenshot tools.
        'data-screenshot': 'toggle-mode',
      }}
      {...props}
    >
      <MenuItem value="system">System</MenuItem>
      <MenuItem value="light">Light</MenuItem>
      <MenuItem value="dark">Dark</MenuItem>
    </Select>
  );
}