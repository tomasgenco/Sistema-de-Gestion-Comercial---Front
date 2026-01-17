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
    CircularProgress,
    Alert
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import type { Product } from './ProductTable';
import { http } from '../../../shared/api/http';

interface EditProductModalProps {
    open: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product) => void;
}

// Tipo para el request al backend
interface EditProductoRequest {
    nombre: string;
    precio: number;
}

// Tipo para la respuesta del backend
interface EditProductoResponse {
    id: number;
    nombre: string;
    precio: number;
    sku: string;
    stock: number;
}

const EditProductModal = ({ open, product, onClose, onSave }: EditProductModalProps) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (product) {
            setName(product.name);
            setPrice(product.price.toString());
        }
    }, [product]);

    const handleSave = async () => {
        if (product && name.trim() && price.trim()) {
            try {
                setLoading(true);
                setError(null);

                const priceNum = parseFloat(price);

                // Preparar el request según el formato del backend
                const requestData: EditProductoRequest = {
                    nombre: name.trim(),
                    precio: priceNum
                };

                // Hacer PUT al backend
                const response = await http.put<EditProductoResponse>(
                    `/producto/editar/${product.id}`,
                    requestData
                );

                // Transformar la respuesta al formato del frontend
                const updatedProduct: Product = {
                    id: String(response.data.id),
                    name: response.data.nombre,
                    barcode: response.data.sku,
                    price: response.data.precio,
                    stock: response.data.stock,
                    status: response.data.stock === 0 ? 'out' : response.data.stock <= 5 ? 'low' : 'available'
                };

                onSave(updatedProduct);
                handleClose();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al actualizar el producto');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClose = () => {
        setName('');
        setPrice('');
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
                    Editar Producto
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
                        disabled={loading}
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
                    onClick={handleSave}
                    variant="contained"
                    disabled={!name.trim() || !price.trim() || loading}
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
                            Guardando...
                        </>
                    ) : (
                        'Guardar Cambios'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditProductModal;
