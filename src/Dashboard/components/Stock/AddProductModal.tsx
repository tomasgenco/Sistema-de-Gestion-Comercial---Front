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
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
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
    precioVenta: number;
    precioCompra: number;
    sku: string | null;
    stock: number; // BigDecimal en backend, soporta decimales
    tipoVenta: 'UNIDAD' | 'PESO';
}

// Tipo para la respuesta del backend
interface ProductoResponse {
    id: number;
    nombre: string;
    precioVenta: number;
    precioCompra: number;
    sku: string;
    stock: number; // BigDecimal en backend, soporta decimales
    tipoVenta: 'UNIDAD' | 'PESO';
}

const AddProductModal = ({ open, onClose, onAdd }: AddProductModalProps) => {
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState(''); // Precio de venta
    const [precioCompra, setPrecioCompra] = useState(''); // Precio de compra
    const [stock, setStock] = useState('');
    const [tipoVenta, setTipoVenta] = useState<'UNIDAD' | 'PESO'>('UNIDAD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async () => {
        if (name.trim() && price.trim() && precioCompra.trim() && stock.trim()) {
            try {
                setLoading(true);
                setError(null);

                const stockNum = parseFloat(stock); // Cambiar a parseFloat para soportar decimales
                const priceNum = parseFloat(price);
                const precioCompraNum = parseFloat(precioCompra);

                // Validar que precio de venta sea mayor que precio de compra
                if (priceNum <= precioCompraNum) {
                    setError('El precio de venta debe ser mayor al precio de compra');
                    setLoading(false);
                    return;
                }

                // Preparar el request según el formato del backend
                const requestData: ProductoRequest = {
                    nombre: name.trim(),
                    precioVenta: priceNum,
                    precioCompra: precioCompraNum,
                    sku: barcode.trim() || null,
                    stock: stockNum,
                    tipoVenta: tipoVenta
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
        setPrecioCompra('');
        setStock('');
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
                        label="SKU (Opcional)"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        fullWidth
                        variant="outlined"
                        placeholder="Ej: SKU-001"
                        disabled={loading}
                        inputProps={{
                            style: { fontFamily: 'monospace' }
                        }}
                        helperText="Código único del producto (opcional)"
                    />
                    <TextField
                        label="Precio de Compra"
                        value={precioCompra}
                        onChange={(e) => {
                            const value = e.target.value;
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
                    <FormControl fullWidth>
                        <InputLabel>Tipo de Venta</InputLabel>
                        <Select
                            value={tipoVenta}
                            label="Tipo de Venta"
                            onChange={(e) => setTipoVenta(e.target.value as 'UNIDAD' | 'PESO')}
                            disabled={loading}
                        >
                            <MenuItem value="UNIDAD">Por Unidad</MenuItem>
                            <MenuItem value="PESO">Por Peso (Kg)</MenuItem>
                        </Select>
                    </FormControl>

                    {tipoVenta === 'PESO' && (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            <strong>Importante:</strong> Los precios de compra y venta deben ser por kilogramo ($/Kg)
                        </Alert>
                    )}

                    <TextField
                        label={tipoVenta === 'PESO' ? "Stock Inicial (Kg)" : "Stock Inicial"}
                        value={stock}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Permitir decimales si es por peso, solo enteros si es por unidad
                            const regex = tipoVenta === 'PESO' ? /^\d*\.?\d*$/ : /^\d+$/;
                            if (value === '' || regex.test(value)) {
                                setStock(value);
                            }
                        }}
                        fullWidth
                        variant="outlined"
                        type="text"
                        placeholder={tipoVenta === 'PESO' ? "Cantidad en kilogramos" : "Cantidad de unidades"}
                        disabled={loading}
                        helperText={tipoVenta === 'PESO' ? "Puede ingresar decimales (ej: 2.5)" : "Solo números enteros"}
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
                    disabled={!name.trim() || !price.trim() || !precioCompra.trim() || !stock.trim() || loading}
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
