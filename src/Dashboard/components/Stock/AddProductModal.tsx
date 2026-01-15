import { useState } from 'react';
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

interface AddProductModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (product: Omit<Product, 'id'>) => void;
}

const AddProductModal = ({ open, onClose, onAdd }: AddProductModalProps) => {
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    const handleAdd = () => {
        if (name.trim() && barcode.trim() && price.trim() && stock.trim()) {
            const stockNum = parseInt(stock);
            const newProduct: Omit<Product, 'id'> = {
                name: name.trim(),
                barcode: barcode.trim(),
                price: parseFloat(price),
                stock: stockNum,
                category: 'General', // Categoría por defecto
                status: stockNum === 0 ? 'out' : stockNum <= 5 ? 'low' : 'available'
            };
            onAdd(newProduct);
            handleClose();
        }
    };

    const handleClose = () => {
        setName('');
        setBarcode('');
        setPrice('');
        setStock('');
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
                    Agregar Nuevo Producto
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
                        label="Código de Barra"
                        value={barcode}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Solo permitir números
                            if (value === '' || /^\d+$/.test(value)) {
                                setBarcode(value);
                            }
                        }}
                        fullWidth
                        variant="outlined"
                        placeholder="Ej: 7891234567890"
                        inputProps={{
                            style: { fontFamily: 'monospace' }
                        }}
                    />
                    <TextField
                        label="Precio"
                        value={price}
                        onChange={(e) => {
                            const value = e.target.value;
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
                    <TextField
                        label="Stock Inicial"
                        value={stock}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d+$/.test(value)) {
                                setStock(value);
                            }
                        }}
                        fullWidth
                        variant="outlined"
                        type="text"
                        placeholder="Cantidad de unidades"
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
                    onClick={handleAdd}
                    variant="contained"
                    disabled={!name.trim() || !barcode.trim() || !price.trim() || !stock.trim()}
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
                    Agregar Producto
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddProductModal;
