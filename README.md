# Some bad ts performance issues

## Reproduce

```bash
pnpm install
pnpm analyze-ts
```

then you can check the terminal output or just check file: [analyze-result.txt](./analyze-result.txt)

## MUI

### [different version of `@mui/system`](./src/differentVersionOfMuiSystem.tsx)

The reason why your project has `@mui/system` is case by case, but we can reproduce this situation like the `package.json` config in this repo:

```json
{
  "dependencies": {
    "@mui/lab": "5.0.0-alpha.170",
    "@mui/material": "^5.15.20"
  },
  "pnpm": {
    "overrides": {
      "@mui/lab>@mui/system": "5.15.15"
    }
  }
}
```

code:

```ts
import { LoadingButton } from '@mui/lab';
import type { SxProps, Theme } from '@mui/material';

interface MyButtonProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const MyButton = ({ children, sx }: MyButtonProps) => {
  // the sx prop of LoadingButton is from @mui/system@5.15.15 installed by @mui/lab
  // the sx prop of MyButton is from @mui/system@5.25.20 installed by @mui/material
  // compare them will cause significant performance issue
  return <LoadingButton sx={sx}>{children}</LoadingButton>;
};
```

ts trace result:

> Check file /users/yutengjing/code/ts-perf-issue/src/differentversionofmuisystem.tsx (<span style="color: red">9655ms</span>)

#### solution

for yarn users:

```jsonc
{
  "resolutions": {
    "@mui/system": "5.25.20"
  }
}
```

for pnpm users:

```jsonc
{
  "pnpm": {
    "overrides": {
      "@mui/system": "5.25.20"
    }
  }
}
```

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

> Check file /users/yutengjing/code/ts-perf-issue/src/sxprops.tsx (<span style="color: red">675ms</span>)

#### solution

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

> Check file /users/yutengjing/code/ts-perf-issue/src/createtheme.tsx (<span style="color: red">1568ms</span>)

#### solution

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

## Useful VSCode Settings

```jsonc
{
  // don't adjust following if you not understand them
  // "typescript.tsdk": "node_modules/typescript/lib",
  // "typescript.tsserver.maxTsServerMemory": 4096,
  // "typescript.tsserver.nodePath": "node",

  // find references maybe slow
  // "typescript.referencesCodeLens.enabled": false,

  // theme modules consist many useless types especially aws-sdk
  "typescript.preferences.autoImportFileExcludePatterns": [
    "node_modules/@iconify-json",
    "node_modules/@@google-cloud",
    "node_modules/@mui/icons-material",
    "node_modules/@mui/lab",
    "node_modules/@mui/system",
    "node_modules/@mui/x-*/**",
    "node_modules/**/internals",
    "node_modules/aws-sdk",
    "node_modules/framer-motion",
    "node_modules/typescript"
  ]
}
```

recommend extension:

- [zardoy.ts-essential-plugins](https://marketplace.visualstudio.com/items?itemName=zardoy.ts-essential-plugins)
- [tsperf.tracer](https://marketplace.visualstudio.com/items?itemName=tsperf.tracer)

```jsonc
// my personal settings
{
  // "tsEssentialPlugins.patchOutline": true,
  // "tsEssentialPlugins.experiments.excludeNonJsxCompletions": true,
  "tsEssentialPlugins.removeCodeFixes.codefixes": [
    "fixMissingFunctionDeclaration",
    "fixMissingAttributes"
  ],
  "tsEssentialPlugins.arrayMethodsSnippets.enable": true,
  "tsEssentialPlugins.fixSuggestionsSorting": true,
  "tsEssentialPlugins.inlayHints.missingJsxAttributes.enabled": true,
  "tsEssentialPlugins.jsxEmmet.modernize": true,
  "tsEssentialPlugins.suggestions.ignoreAutoImports": [
    // "@mui/icons-material/*/*",
    "console",
    "path/*",
    "crypto",
    "dns",
    "http",
    "https",
    "net",
    "stream",
    "tls",
    "v8",
    "zlib"
  ],
  "tsEssentialPlugins.suggestions.localityBonus": true,
  "tsEssentialPlugins.tupleHelpSignature": true
}
```

## Useful ESLint Rules

```javascript
{
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.cts', '*.mts'],
      rules: {
        'lines-between-class-members': off,
        'no-restricted-syntax': [
          'error',
          {
            selector: 'TSTypeReference[typeName.name="SxProps"]:not([typeParameters])',
            message: 'SxProps must have Theme parameter to avoid significant compiler slowdown.',
          },
          {
            selector: 'TSTypeReference[typeName.name="Components"]:not([typeParameters])',
            message: 'Components must have Theme parameter to avoid significant compiler slowdown.',
          },
        ],
      },
    }
  ],
  'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@mui/material', '@mui/system', '!@mui/material/'],
            importNames: [
              'styled',
              'alpha',
              'SxProps',
              'createTheme',
              'useTheme',
              'Theme',
              'ThemeOptions',
              'ThemeProvider',
            ],
            message: "Please import it from '@mui/material/styles' instead.",
          },
          {
            group: ['@mui/material/*/*'],
            message:
              'Only support first and second-level imports. Anything deeper is considered private and can cause issues',
          },
        ],
      },
    ],

}
```

### some related links

- <https://gist.github.com/casamia918/dafd630a1cdd81935a4587297acaae00>
- <https://github.com/microsoft/TypeScript/wiki/Performance-Tracing>
- <https://github.com/microsoft/TypeScript/issues/34801>
- <https://github.com/microsoft/TypeScript/issues/34801#issuecomment-1679272995>
- <https://github.com/microsoft/vscode/issues/215427>
