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
    Grid
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { Provider } from './ProveedoresContent';

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

    useEffect(() => {
        if (open) {
            setName('');
            setContact('');
            setEmail('');
            setPhone('');
            setAddress('');
            setCuit('');
        }
    }, [open]);

    const handleAdd = () => {
        if (name.trim() && contact.trim() && email.trim() && phone.trim() && cuit.trim()) {
            const newProvider: Omit<Provider, 'id'> = {
                name: name.trim(),
                contact: contact.trim(),
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim(),
                cuit: cuit.trim(),
                totalPurchases: 0,
                lastPurchaseDate: new Date().toISOString(),
                status: 'active'
            };
            onAdd(newProvider);
            onClose();
        }
    };

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
    );
};

export default AddProviderModal;
