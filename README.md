# Some bad ts performance issues

## Reproduce

```sh
pnpm install
pnpm analyze-ts
```

then you can check the terminal output or just check file: [analyze-result.txt](./analyze-result.txt)

## MUI

### [SxProps without Theme param](./src/SxProps.tsx)

code:

```ts
import { Button, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';

interface MyButtonProps {
  children: ReactNode;
  sx?: SxProps;
}

function MyButton({ children, sx }: MyButtonProps) {
  return (
    <Button
      sx={{
        color: 'primary.main',
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}

export function App() {
  return (
    <MyButton
      sx={{
        backgroundColor: 'primary.main',
      }}
    >
      SxProps without Theme param cause bad ts performance{' '}
    </MyButton>
  );
}
```

ts trace result:

> Check file /users/yutengjing/code/ts-perf-issue/src/sxprops.tsx (675ms)

solution:

```ts
import { SxProps, Theme } from '@mui/material/styles';

// use SxProps with Theme param
interface MyButtonProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}
```

### [createTheme](./src/createTheme.tsx)

code:

```ts
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface EditorThemeProps {
  children: ReactNode;
}

export function EditorTheme({ children }: EditorThemeProps) {
  const baseTheme = useTheme();
  const theme = createTheme(baseTheme, {});
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

ts trace result:

> Check file /users/yutengjing/code/ts-perf-issue/src/createtheme.tsx (1568ms)

solution:

```ts
// avoid type check by assertion any
const theme = createTheme(baseTheme as any, {});

// or alias it
import type { Components, Theme } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

export const createMuiTheme = createTheme as unknown as (
  baseTheme: Theme,
  options?: {
    components: Components<Theme>;
  },
) => Theme;
```
