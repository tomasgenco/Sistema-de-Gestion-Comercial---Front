import { Box, Typography } from '@mui/material';

interface DashboardHeaderProps {
    title: string;
    subtitle: string;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => (
    <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a', mb: 1 }}>
            {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
            {subtitle}
        </Typography>
    </Box>
);

export default DashboardHeader;
