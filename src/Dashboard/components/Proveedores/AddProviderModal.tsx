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
    Grid,
    CircularProgress,
    Typography,
    Alert
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { Provider } from './ProveedoresContent';
import { http } from '../../../shared/api/http';

interface AddProviderModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (provider: Omit<Provider, 'id'>) => void;
}

const AddProviderModal = ({ open, onClose, onAdd }: AddProviderModalProps) => {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [cuit, setCuit] = useState('');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setName('');
            setContact('');
            setEmail('');
            setPhone('');
            setAddress('');
            setCuit('');
            setConfirmModalOpen(false);
            setError(null);
        }
    }, [open]);


    const handleAdd = () => {
        if (name.trim() && contact.trim() && email.trim() && phone.trim() && cuit.trim()) {
            setConfirmModalOpen(true);
        }
    };

    const handleConfirmAdd = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const providerData = {
                nombreEmpresa: name.trim(),
                cuit: cuit.trim(),
                personaContacto: contact.trim(),
                email: email.trim(),
                telefono: phone.trim(),
                direccion: address.trim() || null
            };

            await http.post('/proveedores', providerData);

            // Cerrar modales y notificar al padre
            setConfirmModalOpen(false);
            onClose();
            onAdd({} as any); // Trigger refresh in parent
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al agregar el proveedor');
            setConfirmModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
                        Agregar Nuevo Proveedor
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <MdClose />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
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
                                placeholder="30-12345678-9"
                            />
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
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAdd}
                        variant="contained"
                        disabled={!name.trim() || !contact.trim() || !email.trim() || !phone.trim() || !cuit.trim()}
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
                        Agregar Proveedor
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Modal */}
            <Dialog
                open={confirmModalOpen}
                onClose={() => !isLoading && setConfirmModalOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 4, p: 2, minWidth: 400 }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">
                        ¿Confirmar Nuevo Proveedor?
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        ¿Está seguro que desea agregar este proveedor?
                    </Typography>
                    <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Empresa:</strong> {name}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Contacto:</strong> {contact}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Email:</strong> {email}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Teléfono:</strong> {phone}</Typography>
                        <Typography variant="body2"><strong>CUIT:</strong> {cuit}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ gap: 1, p: 2 }}>
                    <Button
                        onClick={() => setConfirmModalOpen(false)}
                        variant="outlined"
                        disabled={isLoading}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmAdd}
                        variant="contained"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{
                            bgcolor: '#10b981',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: '#059669'
                            }
                        }}
                    >
                        {isLoading ? 'Guardando...' : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddProviderModal;
