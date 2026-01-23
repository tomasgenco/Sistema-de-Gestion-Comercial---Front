import { Box, Typography } from '@mui/material';
import loginBg from '../assets/login_abstract_bg.png';

export default function LoginSidePanel() {
    return (
        <Box
            sx={{
                flex: 1.5,
                backgroundImage: `url(${loginBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center', // Content centered vertically
                justifyContent: 'center', // Content centered horizontally
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to top, rgba(25, 118, 210, 0.9) 0%, rgba(25, 118, 210, 0.4) 40%, rgba(25, 118, 210, 0) 100%)', // Blue gradient upwards
                    zIndex: 1,
                }
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 2, p: 6, width: '100%', textAlign: 'center' }}>
                <Typography variant="h2" component="h1" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                    La plataforma profesional para administrar su negocio
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Stock, ventas y finanzas en un solo lugar
                </Typography>
            </Box>
        </Box>
    );
}
