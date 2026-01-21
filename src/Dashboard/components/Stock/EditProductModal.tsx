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
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
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
    precioVenta: number;
    precioCompra: number;
    tipoVenta: 'UNIDAD' | 'PESO';
}

// Tipo para la respuesta del backend
interface EditProductoResponse {
    id: number;
    nombre: string;
    precioVenta: number;
    precioCompra: number;
    sku: string;
    stock: number; // BigDecimal en backend, soporta decimales
    tipoVenta: 'UNIDAD' | 'PESO';
}

const EditProductModal = ({ open, product, onClose, onSave }: EditProductModalProps) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(''); // Precio de venta
    const [precioCompra, setPrecioCompra] = useState(''); // Precio de compra
    const [tipoVenta, setTipoVenta] = useState<'UNIDAD' | 'PESO'>('UNIDAD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (product) {
            setName(product.name);
            setPrice(product.price.toString());
            setPrecioCompra(product.precioCompra.toString());
            // Si el producto tiene tipoVenta, usarlo; sino, por defecto UNIDAD
            setTipoVenta(product.tipoVenta || 'UNIDAD');
        }
    }, [product]);

    const handleSave = async () => {
        if (product && name.trim() && price.trim() && precioCompra.trim()) {
            try {
                setLoading(true);
                setError(null);

                const priceNum = parseFloat(price);
                const precioCompraNum = parseFloat(precioCompra);

                // Validar que precio de venta sea mayor que precio de compra
                if (priceNum <= precioCompraNum) {
                    setError('El precio de venta debe ser mayor al precio de compra');
                    setLoading(false);
                    return;
                }

                // Preparar el request según el formato del backend
                const requestData: EditProductoRequest = {
                    nombre: name.trim(),
                    precioVenta: priceNum,
                    precioCompra: precioCompraNum,
                    tipoVenta: tipoVenta
                };

                // Hacer PUT al backend
                const response = await http.put<EditProductoResponse>(
                    `/producto/editar/${product.id}`,
                    requestData
                );

                // Transformar la respuesta al formato del frontend
                // Calcular margen si no viene del backend
                const margen = response.data.precioCompra > 0
                    ? ((response.data.precioVenta - response.data.precioCompra) / response.data.precioCompra) * 100
                    : 0;

                const updatedProduct: Product = {
                    id: String(response.data.id),
                    name: response.data.nombre,
                    barcode: response.data.sku,
                    price: response.data.precioVenta,
                    precioCompra: response.data.precioCompra,
                    margen: margen,
                    stock: response.data.stock,
                    status: response.data.stock === 0 ? 'out' : response.data.stock <= 5 ? 'low' : 'available',
                    tipoVenta: response.data.tipoVenta
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
        setPrecioCompra('');
        setTipoVenta('UNIDAD');
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
                        label="Precio de Compra"
                        value={precioCompra}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Solo permitir números y punto decimal
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                setPrecioCompra(value);
                            }
                        }}
                        fullWidth
                        variant="outlined"
                        type="text"
                        disabled={loading}
                        InputProps={{
                            startAdornment: <Box sx={{ mr: 1, color: '#64748b' }}>$</Box>,
                        }}
                        helperText="Precio al que compras el producto"
                    />
                    <TextField
                        label="Precio de Venta"
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
                        helperText="Precio al que vendes el producto"
                    />

                    <FormControl fullWidth variant="outlined" disabled={loading}>
                        <InputLabel>Tipo de Venta</InputLabel>
                        <Select
                            value={tipoVenta}
                            onChange={(e) => setTipoVenta(e.target.value as 'UNIDAD' | 'PESO')}
                            label="Tipo de Venta"
                        >
                            <MenuItem value="UNIDAD">Por Unidad</MenuItem>
                            <MenuItem value="PESO">Por Peso (kg)</MenuItem>
                        </Select>
                    </FormControl>

                    {tipoVenta === 'PESO' && (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            <strong>Importante:</strong> Los precios de compra y venta deben ser por kilogramo ($/Kg)
                        </Alert>
                    )}

                    {precioCompra && price && parseFloat(price) > parseFloat(precioCompra) && (
                        <Box sx={{ p: 2, bgcolor: '#dcfce7', borderRadius: 2, border: '1px solid #16a34a' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ color: '#166534', fontWeight: 600 }}>Margen de ganancia:</Box>
                                <Box sx={{ color: '#16a34a', fontWeight: 700, fontSize: '1.1rem' }}>
                                    {(((parseFloat(price) - parseFloat(precioCompra)) / parseFloat(precioCompra)) * 100).toFixed(1)}%
                                </Box>
                            </Box>
                        </Box>
                    )}
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
                    disabled={!name.trim() || !price.trim() || !precioCompra.trim() || loading}
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
