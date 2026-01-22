import { Box, Typography } from '@mui/material';
import { PrincipalContent } from './Principal';
import { StockContent } from './Stock';
import { VentasContent } from './Ventas';
import { ProveedoresContent } from './Proveedores';
import { FinanzasContent } from './Finanzas';


interface DashboardContentProps {
    activeModule: string;
}

const DashboardContent = ({ activeModule }: DashboardContentProps) => {
    // Renderizar el contenido según el módulo activo
    switch (activeModule) {
        case 'Principal':
            return <PrincipalContent />;

        case 'Stock':
            return <StockContent />;

        case 'Ventas':
            return <VentasContent />;

        case 'Proveedores':
            return <ProveedoresContent />;

        case 'Finanzas':
            return <FinanzasContent />;

        default:
            return (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="h5" color="text.secondary">
                        Módulo no encontrado
                    </Typography>
                </Box>
            );
    }
};

export default DashboardContent;
