import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { MdClose, MdSearch, MdQrCodeScanner } from 'react-icons/md';
import type { SaleItem } from './VentasContent';
import SaleDetailTable from '../Ventas/SaleDetailTable';
import { http } from '../../../shared/api/http';

interface SaleModalProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
}

// Interface para la respuesta del producto del backend
interface ProductoAPI {
    id: number;
    nombre: string;
    sku: string;
    precio: number;
    stock: number;
}

// Mapear método de pago del frontend al backend
const mapPaymentMethodToBackend = (method: string): string => {
    const map: Record<string, string> = {
        'efectivo': 'EFECTIVO',
        'mercadopago': 'MERCADO_PAGO',
        'cuentadni': 'CUENTA_DNI',
        'tarjetacredito': 'TARJETA_CREDITO',
        'tarjetadebito': 'TARJETA_DEBITO'
    };
    return map[method] || 'EFECTIVO';
};

const SaleModal = ({ open, onClose, onSave }: SaleModalProps) => {
    const [items, setItems] = useState<SaleItem[]>([]);
    const [searchByName, setSearchByName] = useState('');
    const [suggestions, setSuggestions] = useState<ProductoAPI[]>([]);
    const [searchByBarcode, setSearchByBarcode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'mercadopago' | 'cuentadni' | 'tarjetacredito' | 'tarjetadebito'>('efectivo');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado para notificaciones (SnackBar)
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const lastInputTimeRef = useRef<number>(0);
    const barcodeBufferRef = useRef<string>('');

    // Limpiar formulario al abrir/cerrar
    useEffect(() => {
        if (open) {
            setItems([]);
            setSearchByName('');
            setSuggestions([]);
            setSearchByBarcode('');
            setPaymentMethod('efectivo');
            setConfirmModalOpen(false);
            setError(null);
        }
    }, [open]);

    // Focus en el input de código de barras al abrir
    useEffect(() => {
        if (open && barcodeInputRef.current) {
            setTimeout(() => {
                barcodeInputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    // Auto-submit cuando se detecta escaneo de código de barras
    // Los escáneres típicamente ingresan el código muy rápido (< 100ms entre caracteres)
    useEffect(() => {
        const handleBarcodeInput = (e: Event) => {
            const inputEvent = e as InputEvent;
            const currentTime = Date.now();
            const timeDiff = currentTime - lastInputTimeRef.current;

            // Si el tiempo entre caracteres es muy corto, es probablemente un escáner
            if (timeDiff < 50 && timeDiff > 0) {
                barcodeBufferRef.current += inputEvent.data || '';
            } else {
                barcodeBufferRef.current = inputEvent.data || '';
            }

            lastInputTimeRef.current = currentTime;

            // Si detectamos un Enter rápido después de varios caracteres, es un escáner
            if (barcodeBufferRef.current.length > 5) {
                setTimeout(() => {
                    if (searchByBarcode.trim().length > 5) {
                        handleAddByBarcode();
                    }
                }, 50);
            }
        };

        const barcodeInput = barcodeInputRef.current;
        if (barcodeInput && open) {
            barcodeInput.addEventListener('input', handleBarcodeInput);
            return () => {
                barcodeInput.removeEventListener('input', handleBarcodeInput);
            };
        }
    }, [open, searchByBarcode]);

    // Cargar sugerencias al escribir nombre
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchByName.trim().length > 1) {
                try {
                    const response = await http.get<ProductoAPI[]>(`/producto/search?q=${encodeURIComponent(searchByName)}`);
                    setSuggestions(response.data || []);
                } catch (err) {
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchByName]);

    const handleBarcodeKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddByBarcode();
        }
    };

    const handleAddByBarcode = async () => {
        if (!searchByBarcode.trim()) return;

        try {
            const response = await http.get<ProductoAPI[]>(`/producto/search?q=${encodeURIComponent(searchByBarcode.trim())}`);
            const product = response.data?.[0]; // Tomamos el primer resultado que coincida con el código (SKU)

            if (product) {
                if (product.stock === 0) {
                    showSnackbar('Producto sin stock disponible', 'warning');
                    setSearchByBarcode('');
                    return;
                }

                addProductToSale(product);
                setSearchByBarcode('');
                barcodeInputRef.current?.focus();
            } else {
                showSnackbar('Código de barras no encontrado', 'error');
                setSearchByBarcode('');
            }
        } catch (err) {
            showSnackbar('Error al buscar el producto', 'error');
        }
    };

    const handleAddByName = async () => {
        if (!searchByName.trim()) return;

        try {
            const response = await http.get<ProductoAPI[]>(`/producto/search?q=${encodeURIComponent(searchByName.trim())}`);
            const product = response.data?.[0];

            if (product) {
                if (product.stock === 0) {
                    showSnackbar('Producto sin stock disponible', 'warning');
                    setSearchByName('');
                    return;
                }

                addProductToSale(product);
                setSearchByName('');
                setSuggestions([]);
            } else {
                showSnackbar('Producto no encontrado', 'warning');
                setSearchByName('');
            }
        } catch (err) {
            showSnackbar('Error al buscar el producto', 'error');
        }
    };

    const addProductToSale = (product: ProductoAPI) => {
        const existingItemIndex = items.findIndex(item => item.productId === String(product.id));

        if (existingItemIndex >= 0) {
            const newItems = [...items];
            const currentQuantity = newItems[existingItemIndex].quantity;

            if (currentQuantity >= product.stock) {
                showSnackbar(`Stock máximo alcanzado (${product.stock} unidades)`, 'warning');
                return;
            }

            newItems[existingItemIndex].quantity += 1;
            newItems[existingItemIndex].total = newItems[existingItemIndex].quantity * newItems[existingItemIndex].unitPrice;
            setItems(newItems);
        } else {
            const newItem: SaleItem = {
                productId: String(product.id),
                productName: product.nombre,
                quantity: 1,
                unitPrice: product.precio,
                total: product.precio,
                maxStock: product.stock
            };
            setItems([...items, newItem]);
        }
    };

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setItems(items.filter(item => item.productId !== productId));
            return;
        }

        setItems(items.map(item => {
            if (item.productId === productId) {
                // Validación local usando el stock guardado
                if (item.maxStock !== undefined && newQuantity > item.maxStock) {
                    showSnackbar(`Stock máximo: ${item.maxStock} unidades`, 'warning');
                    return item; // Retornar item sin cambios
                }

                return {
                    ...item,
                    quantity: newQuantity,
                    total: newQuantity * item.unitPrice
                };
            }
            return item;
        }));
    };

    const handleRemoveItem = (productId: string) => {
        setItems(items.filter(item => item.productId !== productId));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSaveClick = () => {
        if (items.length === 0) {
            showSnackbar('Debe agregar al menos un producto a la venta', 'warning');
            return;
        }
        setConfirmModalOpen(true);
    };

    const handleConfirmSave = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Preparar datos en el formato del backend
            const ventaData = {
                metodoPago: mapPaymentMethodToBackend(paymentMethod),
                items: items.map(item => ({
                    nombreProducto: item.productName,
                    cantidad: item.quantity,
                    precioUnitario: item.unitPrice
                }))
            };

            // Enviar al backend
            await http.post('/ventas', ventaData);

            // Cerrar modales y limpiar
            setConfirmModalOpen(false);
            onClose();

            // Notificar al padre para recargar la lista
            onSave();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar la venta');
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
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 2
                }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a' }}>
                        Nueva Venta
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <MdClose />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {/* Búsqueda de productos */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#0f172a' }}>
                            Buscar Productos
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                inputRef={barcodeInputRef}
                                label="Código de Barras"
                                placeholder="Escanear o ingresar código..."
                                value={searchByBarcode}
                                onChange={(e) => setSearchByBarcode(e.target.value)}
                                onKeyPress={handleBarcodeKeyPress}
                                fullWidth
                                InputProps={{
                                    startAdornment: <MdQrCodeScanner size={20} style={{ marginRight: 8, color: '#64748b' }} />
                                }}
                                helperText="Presione Enter después de escanear"
                            />
                            <Button
                                variant="outlined"
                                onClick={handleAddByBarcode}
                                sx={{ minWidth: 120 }}
                            >
                                Buscar
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, position: 'relative', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Nombre del Producto"
                                    placeholder="Buscar por nombre..."
                                    value={searchByName}
                                    onChange={(e) => setSearchByName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddByName();
                                        }
                                    }}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <MdSearch size={20} style={{ marginRight: 8, color: '#64748b' }} />
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleAddByName}
                                    sx={{ minWidth: 120 }}
                                >
                                    Buscar
                                </Button>
                            </Box>

                            {/* Sugerencias en tiempo real */}
                            {suggestions.length > 0 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 10,
                                        bgcolor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 2,
                                        maxHeight: 250,
                                        overflow: 'auto',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                    }}
                                >
                                    {suggestions.map((product) => (
                                        <Box
                                            key={product.id}
                                            onClick={() => {
                                                if (product.stock === 0) {
                                                    alert('Producto sin stock disponible');
                                                    return;
                                                }
                                                addProductToSale(product);
                                                setSearchByName('');
                                            }}
                                            sx={{
                                                p: 2,
                                                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                                                borderBottom: '1px solid #f1f5f9',
                                                opacity: product.stock === 0 ? 0.5 : 1,
                                                '&:hover': {
                                                    bgcolor: product.stock === 0 ? 'transparent' : '#f8fafc'
                                                },
                                                '&:last-child': {
                                                    borderBottom: 'none'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {product.nombre}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        SKU: {product.sku} | Stock: {product.stock}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>
                                                    ${product.precio.toLocaleString('es-AR')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Detalle de venta */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#0f172a' }}>
                            Detalle de Venta
                        </Typography>

                        <SaleDetailTable
                            items={items}
                            onQuantityChange={handleQuantityChange}
                            onRemoveItem={handleRemoveItem}
                        />
                    </Box>

                    {/* Total y método de pago */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: '#f8fafc',
                        p: 3,
                        borderRadius: 3,
                        border: '2px solid #e2e8f0'
                    }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Método de Pago</InputLabel>
                            <Select
                                value={paymentMethod}
                                label="Método de Pago"
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                            >
                                <MenuItem value="efectivo">Efectivo</MenuItem>
                                <MenuItem value="mercadopago">Mercado Pago</MenuItem>
                                <MenuItem value="cuentadni">Cuenta DNI</MenuItem>
                                <MenuItem value="tarjetacredito">Tarjeta Crédito</MenuItem>
                                <MenuItem value="tarjetadebito">Tarjeta Débito</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Total a Pagar
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a' }}>
                                ${calculateTotal().toLocaleString('es-AR')}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveClick}
                        variant="contained"
                        disabled={items.length === 0}
                        sx={{
                            bgcolor: '#0f172a',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            '&:hover': {
                                bgcolor: '#1e293b'
                            }
                        }}
                    >
                        Guardar Venta
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Modal */}
            <Dialog
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 4, p: 2 }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">
                        ¿Confirmar Venta?
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#fee2e2', borderRadius: 2 }}>
                            <Typography variant="body2" color="error">
                                {error}
                            </Typography>
                        </Box>
                    )}
                    <Typography variant="body1" color="text.secondary">
                        ¿Está seguro que desea guardar esta venta por un total de <strong>${calculateTotal().toLocaleString('es-AR')}</strong>?
                    </Typography>
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
                        onClick={handleConfirmSave}
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

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default SaleModal;
