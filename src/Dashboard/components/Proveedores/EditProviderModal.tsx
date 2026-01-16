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
    Grid
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { Provider } from './ProveedoresContent';

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
    const [status, setStatus] = useState<'active' | 'inactive'>('active');

    useEffect(() => {
        if (open && provider) {
            setName(provider.name);
            setContact(provider.contact);
            setEmail(provider.email);
            setPhone(provider.phone);
            setAddress(provider.address);
            setCuit(provider.cuit);
            setStatus(provider.status);
        }
    }, [open, provider]);

    const handleSave = () => {
        if (!provider || !name.trim() || !contact.trim() || !email.trim() || !phone.trim() || !cuit.trim()) return;

        const updatedProvider: Provider = {
            ...provider,
            name: name.trim(),
            contact: contact.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            cuit: cuit.trim(),
            status
        };
        onSave(updatedProvider);
        onClose();
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
                                value={status}
                                label="Estado"
                                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                            >
                                <MenuItem value="active">Activo</MenuItem>
                                <MenuItem value="inactive">Inactivo</MenuItem>
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
                    Guardar Cambios
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditProviderModal;
