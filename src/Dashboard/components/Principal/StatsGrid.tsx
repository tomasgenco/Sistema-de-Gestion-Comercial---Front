import { Grid, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { http } from '../../../shared/api/http';

const StatsGrid = () => {
    const [ingresos, setIngresos] = useState<number>(0);
    const [egresos, setEgresos] = useState<number>(0);
    const [ventas, setVentas] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch ingresos y egresos en paralelo
                const [ingresosResponse, egresosResponse, ventasResponse] = await Promise.all([
                    http.get('/ingresos/total'),
                    http.get('/gastos/total'),
                    http.get('/ventas/mes/cantidad')
                ]);

                // Asumiendo que la respuesta viene en response.data
                setIngresos(ingresosResponse.data || 0);
                setEgresos(egresosResponse.data || 0);
                setVentas(ventasResponse.data || 0);

            } catch (error) {
                // En caso de error, mantener los valores en 0
                setIngresos(0);
                setEgresos(0);
                setVentas(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Cálculo del resultado del día (Ingresos - Egresos)
    const resultado = ingresos - egresos;

    return (
        <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                    title="Ventas del mes"
                    value={loading ? <CircularProgress size={24} /> : `${ventas}`}
                    trend="up"
                    trendValue="+12.5%"
                    type="positive"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                    title="Ingresos Totales"
                    value={loading ? <CircularProgress size={24} /> : `$${ingresos.toLocaleString('es-AR')}`}
                    trend="up"
                    trendValue="+8.2%"
                    type="positive"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                    title="Egresos Totales"
                    value={loading ? <CircularProgress size={24} /> : `$${egresos.toLocaleString('es-AR')}`}
                    trend="down"
                    trendValue="-2.4%"
                    type="negative"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                    title="Resultado del día"
                    value={loading ? <CircularProgress size={24} /> : `$${resultado.toLocaleString('es-AR')}`}
                    trend={resultado >= 0 ? "up" : "down"}
                    trendValue="+15.3%"
                    type={resultado >= 0 ? "positive" : "negative"}
                />
            </Grid>
        </Grid>
    );
};

export default StatsGrid;
