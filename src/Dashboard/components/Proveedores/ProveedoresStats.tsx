import { Box, Paper, Typography } from '@mui/material';
import { MdBusiness, MdCheckCircle, MdAttachMoney } from 'react-icons/md';

interface ProveedoresStatsProps {
    totalProviders: number;
    activeProviders: number;
    totalSpent: number;
}

const ProveedoresStats = ({ totalProviders, activeProviders, totalSpent }: ProveedoresStatsProps) => {
    const stats = [
        {
            title: 'Total Proveedores',
            value: totalProviders,
            icon: MdBusiness,
            color: '#3b82f6',
            bgColor: '#dbeafe',
            format: 'number'
        },
        {
            title: 'Proveedores Activos',
            value: activeProviders,
            icon: MdCheckCircle,
            color: '#10b981',
            bgColor: '#d1fae5',
            format: 'number'
        },
        {
            title: 'Total Gastado en el Mes',
            value: totalSpent,
            icon: MdAttachMoney,
            color: '#f59e0b',
            bgColor: '#fef3c7',
            format: 'currency'
        }
    ];

    const formatValue = (value: number, format: string) => {
        if (format === 'currency') {
            return `$${value.toLocaleString('es-AR')}`;
        }
        return value.toLocaleString('es-AR');
    };

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4
        }}>
            {stats.map((stat, index) => (
                <Paper
                    key={index}
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                            borderColor: stat.color
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                                {stat.title}
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a' }}>
                                {formatValue(stat.value, stat.format)}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                bgcolor: stat.bgColor,
                                borderRadius: 3,
                                p: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <stat.icon size={24} color={stat.color} />
                        </Box>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};

export default ProveedoresStats;
