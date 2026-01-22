import { Box, Paper, Typography } from '@mui/material';
import { MdTrendingUp, MdToday, MdInventory, MdShoppingCart, MdTrendingDown, MdCalculate } from 'react-icons/md';

interface FinanzasStatsProps {
    todayCount: number;
    averageSale: number;
    totalInventoryValue: number;
    monthSales: number;
    dayIncome: number;
    dayExpenses: number;
}

const FinanzasStats = ({
    todayCount,
    averageSale,
    totalInventoryValue,
    monthSales,
    dayIncome,
    dayExpenses
}: FinanzasStatsProps) => {
    // Calcular resultado del día
    const dayResult = dayIncome - dayExpenses;

    const stats = [
        // Fila 1: Estadísticas de Ventas
        {
            title: 'Ventas del Día',
            value: todayCount,
            icon: MdToday,
            color: '#3b82f6',
            bgColor: '#dbeafe',
            format: 'number'
        },
        {
            title: 'Ventas del Mes',
            value: monthSales,
            icon: MdShoppingCart,
            color: '#06b6d4',
            bgColor: '#cffafe',
            format: 'number'
        },
        {
            title: 'Promedio por Venta en el Día',
            value: averageSale,
            icon: MdTrendingUp,
            color: '#8b5cf6',
            bgColor: '#ede9fe',
            format: 'currency'
        },
        // Fila 2: Estadísticas Financieras
        {
            title: 'Ingresos del Día',
            value: dayIncome,
            icon: MdTrendingUp,
            color: '#10b981',
            bgColor: '#d1fae5',
            format: 'currency'
        },
        {
            title: 'Egresos del Día',
            value: dayExpenses,
            icon: MdTrendingDown,
            color: '#ef4444',
            bgColor: '#fee2e2',
            format: 'currency'
        },
        {
            title: 'Resultado del Día',
            value: dayResult,
            icon: MdCalculate,
            color: dayResult >= 0 ? '#10b981' : '#ef4444',
            bgColor: dayResult >= 0 ? '#d1fae5' : '#fee2e2',
            format: 'currency'
        },
        {
            title: 'Valor Total del Inventario (Precio Venta)',
            value: totalInventoryValue,
            icon: MdInventory,
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

export default FinanzasStats;
