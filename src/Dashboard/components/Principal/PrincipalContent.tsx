import { Box, Typography } from '@mui/material';
import DashboardHeader from './DashboardHeader';
import StatsGrid from './StatsGrid';
import RecentSalesTable from './RecentSalesTable';
import SalesByHourChart from '../Ventas/SalesByHourChart';
import RevenueByPaymentMethodChart from '../Ventas/RevenueByPaymentMethodChart';

const PrincipalContent = () => {
    return (
        <Box sx={{ width: '100%' }}>
            <DashboardHeader
                title="Dashboard"
                subtitle="Resumen de actividad diaria de tu negocio."
            />

            <StatsGrid />

            {/* Gráficos de Análisis */}
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3, mt: 5 }}>
                Análisis de Ventas
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 5 }}>
                <SalesByHourChart />
                <RevenueByPaymentMethodChart />
            </Box>

            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3 }}>
                Últimas 5 Ventas
            </Typography>
            <RecentSalesTable />
        </Box>
    );
};

export default PrincipalContent;
