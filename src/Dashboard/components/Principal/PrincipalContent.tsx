import { Box, Typography } from '@mui/material';
import DashboardHeader from './DashboardHeader';
import StatsGrid from './StatsGrid';
import RecentSalesTable from './RecentSalesTable';

const PrincipalContent = () => {
    return (
        <Box sx={{ width: '100%' }}>
            <DashboardHeader
                title="Dashboard"
                subtitle="Resumen de actividad diaria de tu negocio."
            />

            <StatsGrid />

            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3 }}>
                Últimas 5 Ventas
            </Typography>
            <RecentSalesTable />
        </Box>
    );
};

export default PrincipalContent;
