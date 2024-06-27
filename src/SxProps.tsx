import { Button, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';

interface MyButtonProps {
    children: ReactNode;
    sx?: SxProps;
}

export function MyButton({ children, sx }: MyButtonProps) {
    return (
        <Button
            sx={{
                backgroundColor: 'red',
                ...sx,
            }}
        >
            {children}
        </Button>
    );
}
