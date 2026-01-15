import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    IconButton
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { Product } from './ProductTable';

interface EditProductModalProps {
    open: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product) => void;
}

const EditProductModal = ({ open, product, onClose, onSave }: EditProductModalProps) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        if (product) {
            setName(product.name);
            setPrice(product.price.toString());
        }
    }, [product]);

    const handleSave = () => {
        if (product && name.trim() && price.trim()) {
            const updatedProduct: Product = {
                ...product,
                name: name.trim(),
                price: parseFloat(price)
            };
            onSave(updatedProduct);
            onClose();
        }
    };

    const handleClose = () => {
        setName('');
        setPrice('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
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
                    Editar Producto
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <MdClose />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                    <TextField
                        label="Nombre del Producto"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        variant="outlined"
                        autoFocus
                    />
                    <TextField
                        label="Precio"
                        value={price}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Solo permitir números y punto decimal
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                setPrice(value);
                            }
                        }}
                        fullWidth
                        variant="outlined"
                        type="text"
                        InputProps={{
                            startAdornment: <Box sx={{ mr: 1, color: '#64748b' }}>$</Box>,
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                <Button
                    onClick={handleClose}
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
                    onClick={handleSave}
                    variant="contained"
                    disabled={!name.trim() || !price.trim()}
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

export default EditProductModal;
