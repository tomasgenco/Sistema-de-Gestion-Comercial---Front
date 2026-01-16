import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import type { Sale } from './VentasContent';

interface SalesByHourChartProps {
    sales: Sale[];
}

const SalesByHourChart = ({ sales }: SalesByHourChartProps) => {
    // Procesar ventas por rango horario de 2 horas
    const processDataByHourRange = () => {
        const hourRanges = [
            { range: '00-02', start: 0, end: 2, count: 0 },
            { range: '02-04', start: 2, end: 4, count: 0 },
            { range: '04-06', start: 4, end: 6, count: 0 },
            { range: '06-08', start: 6, end: 8, count: 0 },
            { range: '08-10', start: 8, end: 10, count: 0 },
            { range: '10-12', start: 10, end: 12, count: 0 },
            { range: '12-14', start: 12, end: 14, count: 0 },
            { range: '14-16', start: 14, end: 16, count: 0 },
            { range: '16-18', start: 16, end: 18, count: 0 },
            { range: '18-20', start: 18, end: 20, count: 0 },
            { range: '20-22', start: 20, end: 22, count: 0 },
            { range: '22-24', start: 22, end: 24, count: 0 },
        ];

        sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            const hour = saleDate.getHours();

            const rangeIndex = hourRanges.findIndex(
                r => hour >= r.start && hour < r.end
            );

            if (rangeIndex !== -1) {
                hourRanges[rangeIndex].count++;
            }
        });

        return hourRanges.map(({ range, count }) => ({
            range,
            ventas: count
        }));
    };

    const data = processDataByHourRange();
    const maxValue = Math.max(...data.map(d => d.ventas));

    // Colores degradados según la cantidad de ventas
    const getBarColor = (value: number) => {
        if (value === 0) return '#e2e8f0';
        const intensity = value / maxValue;
        if (intensity > 0.7) return '#0f172a';
        if (intensity > 0.4) return '#475569';
        return '#94a3b8';
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                height: '100%'
            }}
        >
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', mb: 1 }}>
                    Ventas por Rango Horario
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Distribución de ventas cada 2 horas
                </Typography>
            </Box>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="range"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                        formatter={(value: number | undefined) => value !== undefined ? [`${value} ventas`, 'Cantidad'] : ['0 ventas', 'Cantidad']}
                    />
                    <Bar
                        dataKey="ventas"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.ventas)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Leyenda personalizada */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#0f172a', borderRadius: 1 }} />
                    <Typography variant="caption" color="text.secondary">Alta</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#475569', borderRadius: 1 }} />
                    <Typography variant="caption" color="text.secondary">Media</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#94a3b8', borderRadius: 1 }} />
                    <Typography variant="caption" color="text.secondary">Baja</Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default SalesByHourChart;
