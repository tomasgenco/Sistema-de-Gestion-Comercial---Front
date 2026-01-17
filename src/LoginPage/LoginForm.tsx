import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { MdHexagon } from 'react-icons/md';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../shared/api/http';

export default function LoginForm() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };


    const [error, setError] = useState('');



    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await http.post('/auth/login', { username, password });

            // Guardar el rol del usuario si viene en la respuesta
            if (response.data) {
                // Intentar extraer el rol de diferentes posibles ubicaciones
                const role = response.data.role ||
                    response.data.rol ||
                    response.data.user?.role ||
                    response.data.user?.rol ||
                    'Usuario';

                localStorage.setItem('userRole', role);
            } else {
                localStorage.setItem('userRole', 'Usuario');
            }

            navigate('/dashboard');
        } catch (err) {
            setError('Credenciales inválidas. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Box
            component="form"
            onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
            }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            sx={{ width: '100%', '& .MuiTextField-root': { my: 1, width: '60%', bgcolor: 'background.paper', borderRadius: 5 } }}
            noValidate
            autoComplete="off"
            p={4}
            borderRadius={5}
            m={2}
        >

            <Box sx={{ width: '60%', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <MdHexagon size={24} color="#0f172a" />
                    <Typography fontSize={24} fontWeight="bold" sx={{ ml: 1, letterSpacing: 1.5, color: '#0f172a', textTransform: 'uppercase' }}>
                        STOCKEATE
                    </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: '#0f172a' }}>
                    Bienvenido
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ width: '60%', mb: 2 }}>{error}</Alert>}

            <TextField
                required
                id="outlined-required"
                label="Usuario"
                defaultValue={username}
                onChange={(e) => setUsername(e.target.value)} //setea el username
                helperText={username.length === 0 ? 'Por favor, ingresa un usuario' : ''}
            />

            <TextField
                id="outlined-password-input-required"
                required
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} //setea el password
                helperText={password.length === 0 ? 'Por favor, ingresa una contraseña' : ''}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Button
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={<ArrowForwardIcon />}
                sx={{
                    mt: 2,
                    width: '60%',
                    py: 1.5,
                    borderRadius: '50px',
                    textTransform: 'none',
                    backgroundColor: '#0f172a', // Dark navy/black
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.39)',
                    transition: 'all 0.2s',
                    '&:hover': {
                        backgroundColor: '#1e293b',
                        transform: 'scale(1.02)'
                    }
                }}
            >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>

        </Box>
    );
}
