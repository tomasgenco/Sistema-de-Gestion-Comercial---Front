import { useState } from 'react';
import { Box } from '@mui/material';
import { Sidebar, DashboardContent } from './components';


export default function Dashboard() {
    // Determinar módulo inicial según el rol del usuario
    const getInitialModule = () => {
        const role = localStorage.getItem('userRole') || '';
        return role.toUpperCase() === 'VENDEDOR' ? 'Ventas' : 'Principal';
    };

    const [activeModule, setActiveModule] = useState(getInitialModule());

    // Monitorear cambios de módulo para evitar acceso no autorizado
    const handleModuleChange = (newModule: string) => {
        const role = localStorage.getItem('userRole') || '';
        const isVendor = role.toUpperCase() === 'VENDEDOR';

        // Si es vendedor y trata de acceder a Principal o Stock, redirigir a Ventas
        if (isVendor && (newModule === 'Principal' || newModule === 'Stock')) {
            setActiveModule('Ventas');
            return;
        }

        setActiveModule(newModule);
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc' }}>
            <Sidebar activeModule={activeModule} onModuleChange={handleModuleChange} />
            <Box sx={{ flex: 1, p: 5, overflow: 'auto' }}>
                <DashboardContent activeModule={activeModule} />
            </Box>
        </Box>
    );
}
