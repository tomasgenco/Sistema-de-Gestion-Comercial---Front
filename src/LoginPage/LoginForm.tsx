import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

export default function LoginForm() {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    return (
        <Box
            component="form"
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
            noValidate
            autoComplete="off"
        >

            <TextField
                required
                id="outlined-required"
                label="Usuario"
                defaultValue={username}
                onChange={(e) => setUsername(e.target.value)} //setea el username
            />

            <TextField
                id="outlined-password-input-required"
                required
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                defaultValue={password}
                onChange={(e) => setPassword(e.target.value)} //setea el password
            />

            <Button variant="contained">Iniciar Sesión</Button>

            {/* 
                
             */}

        </Box>
    );
}
