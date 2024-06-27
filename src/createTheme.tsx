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
