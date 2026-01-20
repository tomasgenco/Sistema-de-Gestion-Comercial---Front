import { Box, Typography } from '@mui/material';
import loginAbstractBg from '../assets/login_abstract_bg.png';

export default function LoginSidePanel() {
    return (
        <Box
            sx={{
                flex: 1.5,
                backgroundImage: `url(${loginAbstractBg})`,
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
                    background: 'linear-gradient(to top, rgba(138, 43, 226, 0.9) 0%, rgba(138, 43, 226, 0.4) 40%, rgba(138, 43, 226, 0) 100%)', // Violet gradient upwards
                    zIndex: 1,
                }
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 2, p: 6, width: '100%', textAlign: 'center' }}>
                <Typography variant="h2" component="h1" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                    La plataforma profesional para administrar su negocio.
                </Typography>
                <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 300 }}>
                    Datos, control y eficiencia en un solo sistema.
                </Typography>
            </Box>
        </Box>
    );
}
