import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { MdHexagon, MdDashboard, MdInventory, MdPointOfSale, MdPeople } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SidebarItem from './SidebarItem';

interface SidebarProps {
    activeModule: string;
    onModuleChange: (module: string) => void;
}

const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('Usuario');
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    useEffect(() => {
        // Obtener el rol del usuario desde localStorage
        const role = localStorage.getItem('userRole') || 'Usuario';

        // Capitalizar primera letra
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        setUserRole(formattedRole);
    }, []);

    const handleLogoutClick = () => {
        setLogoutModalOpen(true);
    };

    const handleLogoutConfirm = async () => {
        try {
            // Llamar al backend para eliminar las cookies httpOnly
            await fetch('http://localhost:8080/auth/logout', {
                method: 'POST',
                credentials: 'include', // Importante para enviar las cookies
            });
            console.log('Logout en backend exitoso');
        } catch (error) {
            console.error('Error al hacer logout en backend:', error);
        }

        // Limpiar localStorage
        localStorage.removeItem('userRole');
        localStorage.removeItem('token');

        // Limpiar todas las cookies accesibles
        document.cookie.split(";").forEach((cookie) => {
            const name = cookie.split("=")[0].trim();
            // Eliminar la cookie estableciendo una fecha de expiración pasada
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        console.log('Sesión cerrada - localStorage limpiado');

        // Cerrar modal y navegar al login
        setLogoutModalOpen(false);
        navigate('/');
    };

    const handleLogoutCancel = () => {
        setLogoutModalOpen(false);
    };

    return (
        <Box sx={{ width: 280, borderRight: '1px solid #e2e8f0', bgcolor: 'white', p: 3, display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 6, px: 1 }}>
                <MdHexagon size={32} color="#0f172a" />
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 1.5, color: '#0f172a', letterSpacing: 1 }}>
                    STOCKEATE
                </Typography>
            </Box>

            {/* Navigation */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 2, display: 'block', px: 1 }}>
                    MENU PRINCIPAL
                </Typography>

                <SidebarItem
                    icon={MdDashboard}
                    label="Principal"
                    description="Visión general"
                    active={activeModule === 'Principal'}
                    onClick={() => onModuleChange('Principal')}
                />
                <SidebarItem
                    icon={MdInventory}
                    label="Stock"
                    description="Gestión de inventario"
                    active={activeModule === 'Stock'}
                    onClick={() => onModuleChange('Stock')}
                />
                <SidebarItem
                    icon={MdPointOfSale}
                    label="Ventas"
                    description="Registro de operaciones"
                    active={activeModule === 'Ventas'}
                    onClick={() => onModuleChange('Ventas')}
                />
                <SidebarItem
                    icon={MdPeople}
                    label="Proveedores"
                    description="Administración de socios"
                    active={activeModule === 'Proveedores'}
                    onClick={() => onModuleChange('Proveedores')}
                />
            </Box>

            {/* User Profile / Logout */}
            <Box sx={{ pt: 2, borderTop: '1px solid #e2e8f0' }}>
                <Box
                    sx={{ display: 'flex', alignItems: 'center', p: 1, cursor: 'pointer', borderRadius: 2, '&:hover': { bgcolor: '#f8fafc' } }}
                    onClick={handleLogoutClick}
                >
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography fontWeight="bold" fontSize={12} color="#64748b">{userRole.substring(0, 2).toUpperCase()}</Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#0f172a">
                            ¡Hola, {userRole}!
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Cerrar Sesión</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Logout Confirmation Modal */}
            <Dialog
                open={logoutModalOpen}
                onClose={handleLogoutCancel}
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                    Cerrar Sesión
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="text.secondary">
                        ¿Estás seguro de que deseas cerrar sesión?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleLogoutCancel}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': {
                                borderColor: '#cbd5e1',
                                bgcolor: '#f8fafc'
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#dc2626',
                            '&:hover': {
                                bgcolor: '#b91c1c'
                            }
                        }}
                    >
                        Cerrar Sesión
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Sidebar;
