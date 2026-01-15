import { Box, Typography } from '@mui/material';
import type { ElementType } from 'react';

interface SidebarItemProps {
    icon: ElementType;
    label: string;
    description?: string;
    active?: boolean;
    onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, description, active, onClick }: SidebarItemProps) => (
    <Box
        onClick={onClick}
        sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            mb: 1,
            cursor: 'pointer',
            borderRadius: 3,
            backgroundColor: active ? '#0f172a' : 'transparent',
            color: active ? 'white' : '#64748b',
            transition: 'all 0.2s',
            '&:hover': {
                backgroundColor: active ? '#0f172a' : '#f1f5f9',
                color: active ? 'white' : '#0f172a',
            }
        }}
    >
        <Icon size={24} />
        <Box sx={{ ml: 2 }}>
            <Typography variant="body1" fontWeight={600}>
                {label}
            </Typography>
            {description && (
                <Typography variant="caption" display="block" sx={{ opacity: 0.7, lineHeight: 1 }}>
                    {description}
                </Typography>
            )}
        </Box>
    </Box>
);

export default SidebarItem;
