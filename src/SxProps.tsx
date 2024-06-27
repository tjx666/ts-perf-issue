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
