import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { Provider } from './ProveedoresContent';
import { http } from '../../../shared/api/http';

interface EditProviderModalProps {
    open: boolean;
    provider: Provider | null;
    onClose: () => void;
    onSave: (provider: Provider) => void;
}

const EditProviderModal = ({ open, provider, onClose, onSave }: EditProviderModalProps) => {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [cuit, setCuit] = useState('');
    const [status, setStatus] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && provider) {
            setName(provider.nombreEmpresa);
            setContact(provider.personaContacto);
            setEmail(provider.email);
            setPhone(provider.telefono);
            setAddress(provider.direccion || '');
            setCuit(provider.cuit);
            setStatus(provider.activo);
            setError(null);
        }
    }, [open, provider]);

    const handleSave = async () => {
        if (!provider || !name.trim() || !contact.trim() || !email.trim() || !phone.trim() || !cuit.trim()) return;

        try {
            setIsLoading(true);
            setError(null);

            const providerData = {
                nombreEmpresa: name.trim(),
                cuit: cuit.trim(),
                personaContacto: contact.trim(),
                email: email.trim(),
                telefono: phone.trim(),
                direccion: address.length > 0 ? address.trim() : "",
                activo: status
            };

            await http.put(`/proveedores/${provider.id}`, providerData);

            onSave(provider); // Trigger refresh
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar el proveedor');
        } finally {
            setIsLoading(false);
        }
    };

    if (!provider) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 1
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
                <Box sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#0f172a' }}>
                    Editar Proveedor
                </Box>
                <IconButton onClick={onClose} size="small">
                    <MdClose />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={3} sx={{ pt: 2 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Nombre de la Empresa"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Persona de Contacto"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Teléfono"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="CUIT"
                            value={cuit}
                            onChange={(e) => setCuit(e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={status.toString()}
                                label="Estado"
                                onChange={(e) => setStatus(e.target.value === 'true')}
                            >
                                <MenuItem value="true">Activo</MenuItem>
                                <MenuItem value="false">Inactivo</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Dirección"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: '#0f172a',
                        '&:hover': {
                            bgcolor: '#1e293b'
                        }
                    }}
                >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditProviderModal;
