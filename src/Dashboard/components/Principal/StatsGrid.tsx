import { Grid } from '@mui/material';
import StatCard from './StatCard';

const StatsGrid = () => {
    // Cálculo del resultado del día (Ingresos - Egresos)
    const ingresos = 524890;
    const egresos = 84300;
    const resultado = ingresos - egresos;

    return (
        <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                    title="Ventas del día"
                    value="20"
                    trend="up"
                    trendValue="+12.5%"
                    type="positive"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                    title="Ingresos Totales"
                    value="$524.890"
                    trend="up"
                    trendValue="+8.2%"
                    type="positive"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                    title="Egresos Totales"
                    value="$84.300"
                    trend="down"
                    trendValue="-2.4%"
                    type="negative"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <StatCard
                    title="Resultado del día"
                    value={`$${resultado.toLocaleString('es-AR')}`}
                    trend="up"
                    trendValue="+15.3%"
                    type="positive"
                />
            </Grid>
        </Grid>
    );
};

export default StatsGrid;
