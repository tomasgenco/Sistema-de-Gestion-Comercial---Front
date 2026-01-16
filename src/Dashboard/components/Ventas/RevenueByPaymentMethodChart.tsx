import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import type { Sale } from './VentasContent';

interface RevenueByPaymentMethodChartProps {
    sales: Sale[];
}

const RevenueByPaymentMethodChart = ({ sales }: RevenueByPaymentMethodChartProps) => {
    // Procesar ingresos por método de pago
    const processDataByPaymentMethod = () => {
        const paymentMethods = {
            efectivo: { label: 'Efectivo', total: 0, color: '#10b981' },
            mercadopago: { label: 'Mercado Pago', total: 0, color: '#3b82f6' },
            cuentadni: { label: 'Cuenta DNI', total: 0, color: '#f59e0b' },
            tarjetacredito: { label: 'Tarjeta Crédito', total: 0, color: '#ec4899' },
            tarjetadebito: { label: 'Tarjeta Débito', total: 0, color: '#8b5cf6' },
        };

        sales.forEach(sale => {
            if (paymentMethods[sale.paymentMethod]) {
                paymentMethods[sale.paymentMethod].total += sale.total;
            }
        });

        return Object.entries(paymentMethods).map(([, value]) => ({
            method: value.label,
            ingresos: value.total,
            color: value.color
        }));
    };

    const data = processDataByPaymentMethod();

    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString('es-AR')}`;
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
                    Ingresos por Método de Pago
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Total de ingresos según forma de pago
                </Typography>
            </Box>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="method"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                        formatter={(value: number | undefined) => value !== undefined ? [formatCurrency(value), 'Ingresos'] : ['$0', 'Ingresos']}
                    />
                    <Bar
                        dataKey="ingresos"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={80}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Resumen de totales */}
            <Box sx={{
                mt: 3,
                pt: 3,
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2
            }}>
                {data.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: '45%'
                        }}
                    >
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                bgcolor: item.color,
                                borderRadius: '50%'
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {item.method}:
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#0f172a' }}>
                            {formatCurrency(item.ingresos)}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Total general */}
            <Box sx={{
                mt: 2,
                pt: 2,
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#0f172a' }}>
                    Total General:
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a' }}>
                    {formatCurrency(data.reduce((sum, item) => sum + item.ingresos, 0))}
                </Typography>
            </Box>
        </Paper>
    );
};

export default RevenueByPaymentMethodChart;
