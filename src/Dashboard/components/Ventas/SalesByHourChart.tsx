import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { http } from '../../../shared/api/http';

// Tipo de dato que viene del backend
// Tipo de dato que viene del backend
interface VentasPorHora {
    hora: number;
    cantidadVentas: number;
    totalVentas: number;
}

const SalesByHourChart = () => {
    const [data, setData] = useState<{ range: string; ventas: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVentasPorHora = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await http.get<VentasPorHora[]>('/ventas/hoy/por-hora');

                // 1. Generar base de 24 horas (00:00 - 23:00)
                const allHours = Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0') + ':00';
                    return { range: hour, ventas: 0 };
                });

                // 2. Crear mapa de ventas existentes
                const salesMap = new Map<string, number>();

                (response.data || []).forEach(item => {
                    // Convertir el número de hora (ej: 9) a formato "09:00"
                    const normalizedHour = item.hora.toString().padStart(2, '0') + ':00';
                    salesMap.set(normalizedHour, item.cantidadVentas);
                });

                // 3. Combinar base con datos reales
                const finalData = allHours.map(h => ({
                    range: h.range,
                    ventas: salesMap.get(h.range) || 0
                }));

                setData(finalData);
            } catch (err) {
                setError('Error al cargar datos de ventas por hora');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVentasPorHora();
    }, []);

    const maxValue = Math.max(...data.map(d => d.ventas), 1);

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
                    Ventas por Hora
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Distribución de ventas durante las 24 horas del día
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <CircularProgress size={40} />
                </Box>
            ) : error ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : (
                <>
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
                </>
            )}
        </Paper>
    );
};

export default SalesByHourChart;
