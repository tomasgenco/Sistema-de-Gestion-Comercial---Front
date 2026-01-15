import { useState } from 'react';
import { Box } from '@mui/material';
import { Sidebar, DashboardContent } from './components';


export default function Dashboard() {
    const [activeModule, setActiveModule] = useState('Principal');

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc' }}>
            <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
            <Box sx={{ flex: 1, p: 5, overflow: 'auto' }}>
                <DashboardContent activeModule={activeModule} />
            </Box>
        </Box>
    );
}
