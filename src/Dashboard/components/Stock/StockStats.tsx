import { Grid } from '@mui/material';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { MdInventory, MdTrendingDown, MdAttachMoney, MdCategory } from 'react-icons/md';

interface StockStatsProps {
    totalProducts: number;
    lowStockProducts: number;
    totalValue: number;
    categories: number;
}

const StockStats = ({ totalProducts, lowStockProducts, totalValue, categories }: StockStatsProps) => {
    const stats = [
        {
            title: 'Total Productos',
            value: totalProducts.toString(),
            icon: MdInventory,
            color: '#3b82f6',
            bgColor: '#eff6ff'
        },
        {
            title: 'Stock Bajo',
            value: lowStockProducts.toString(),
            icon: MdTrendingDown,
            color: '#f59e0b',
            bgColor: '#fef3c7'
        },
        {
            title: 'Valor Total',
            value: `$${totalValue.toLocaleString('es-AR')}`,
            icon: MdAttachMoney,
            color: '#10b981',
            bgColor: '#d1fae5'
        },
        {
            title: 'Categorías',
            value: categories.toString(),
            icon: MdCategory,
            color: '#8b5cf6',
            bgColor: '#f3e8ff'
        }
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid #e2e8f0' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                                        {stat.title}
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            bgcolor: stat.bgColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Icon size={20} color={stat.color} />
                                    </Box>
                                </Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a' }}>
                                    {stat.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default StockStats;
