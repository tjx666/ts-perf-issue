import { LoadingButton } from '@mui/lab';
import type { SxProps, Theme } from '@mui/material';

interface MyButtonProps {
    children: React.ReactNode;
    sx?: SxProps<Theme>;
}

export const MyButton = ({ children, sx }: MyButtonProps) => {
    return <LoadingButton sx={sx}>{children}</LoadingButton>;
};
