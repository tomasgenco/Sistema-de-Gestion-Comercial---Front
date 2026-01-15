import { Box } from '@mui/material';
import LoginForm from './LoginForm';
import LoginSidePanel from './LoginSidePanel';

export default function LoginPage() {
    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Side Panel (Left) */}
            <LoginSidePanel />

            {/* Login Form Container (Right) */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    p: 4,
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', // Subtle shadow separation
                    zIndex: 2
                }}
            >
                <div style={{ width: '100%' }}>
                    <LoginForm />
                </div>
            </Box>
        </Box>
    );
}
