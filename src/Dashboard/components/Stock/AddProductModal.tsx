import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import { http } from '../../../shared/api/http';

interface AddProductModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: () => void;
}

// Tipo para el request al backend
interface ProductoRequest {
    nombre: string;
    precio: number;
    sku: string;
    stock: number;
}

// Tipo para la respuesta del backend
interface ProductoResponse {
    id: number;
    nombre: string;
    precio: number;
    sku: string;
    stock: number;
}

const AddProductModal = ({ open, onClose, onAdd }: AddProductModalProps) => {
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async () => {
        if (name.trim() && barcode.trim() && price.trim() && stock.trim()) {
            try {
                setLoading(true);
                setError(null);

                const stockNum = parseInt(stock);
                const priceNum = parseFloat(price);

                // Preparar el request según el formato del backend
                const requestData: ProductoRequest = {
                    nombre: name.trim(),
                    precio: priceNum,
                    sku: barcode.trim(),
                    stock: stockNum
                };

                // Hacer POST al backend
                await http.post<ProductoResponse>('/producto', requestData);

                // Notificar que se agregó el producto
                onAdd();
                handleClose();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al agregar el producto');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClose = () => {
        setName('');
        setBarcode('');
        setPrice('');
        setStock('');
        setError(null);
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
                <IconButton onClick={handleClose} size="small" disabled={loading}>
                    <MdClose />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        label="Nombre del Producto"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        variant="outlined"
                        autoFocus
                        disabled={loading}
                    />
                    <TextField
                        label="SKU"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        fullWidth
                        variant="outlined"
                        placeholder="Ej: SKU-001"
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disabled={loading}
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
                    disabled={!name.trim() || !barcode.trim() || !price.trim() || !stock.trim() || loading}
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
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                            Agregando...
                        </>
                    ) : (
                        'Agregar Producto'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddProductModal;
