import { useState, useEffect, type KeyboardEvent } from 'react';
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
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { MdClose, MdSearch, MdAdd, MdRemove, MdDelete } from 'react-icons/md';
import type { Provider, PurchaseItem } from './ProveedoresContent';
import { http } from '../../../shared/api/http';

interface PurchaseModalProps {
    open: boolean;
    provider: Provider | null;
    onClose: () => void;
    onSave: () => void; // Ya no recibe argumentos, solo notifica que se guardó
}

// Tipo de dato que viene del backend
interface ProductoAPI {
    id: number;
    nombre: string;
    precio: number;
    sku: string;
    stock: number;
}

const PurchaseModal = ({ open, provider, onClose, onSave }: PurchaseModalProps) => {
    const [items, setItems] = useState<PurchaseItem[]>([]);
    const [searchTerm, setSearchTerm] = useState(''); // Valor del input
    const [searchResults, setSearchResults] = useState<ProductoAPI[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'MERCADO_PAGO' | 'CUENTA_DNI' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO'>('EFECTIVO');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mapa para guardar SKU de productos agregados
    const [productSkuMap, setProductSkuMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setItems([]);
            setSearchTerm('');
            setSearchResults([]);
            setConfirmModalOpen(false);
            setPaymentMethod('EFECTIVO');
            setError(null);
            setProductSkuMap({});
        }
    }, [open]);

    // Cargar sugerencias automáticamente al escribir (con debounce)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length > 1) {
                try {
                    setIsSearching(true);
                    const response = await http.get<ProductoAPI[]>(
                        `/producto/search?q=${encodeURIComponent(searchTerm)}`
                    );
                    const dataArray = Array.isArray(response.data) ? response.data : [];
                    setSearchResults(dataArray);
                } catch (err) {
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); // Debounce de 300ms

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearchKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Si hay resultados, agregar el primero
            if (searchResults.length > 0) {
                addProductToPurchase(searchResults[0]);
            }
        }
    };

    const addProductToPurchase = (product: ProductoAPI) => {
        const productId = String(product.id);
        const existingItemIndex = items.findIndex(item => item.productId === productId);

        // Guardar el SKU del producto
        setProductSkuMap(prev => ({
            ...prev,
            [productId]: product.sku
        }));

        if (existingItemIndex >= 0) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += 1;
            newItems[existingItemIndex].total = newItems[existingItemIndex].quantity * newItems[existingItemIndex].unitPrice;
            setItems(newItems);
        } else {
            const newItem: PurchaseItem = {
                productId: productId,
                productName: product.nombre,
                quantity: 1,
                unitPrice: product.precio,
                total: product.precio
            };
            setItems([...items, newItem]);
        }

        // Limpiar búsqueda después de agregar
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setItems(items.filter(item => item.productId !== productId));
        } else {
            setItems(items.map(item => {
                if (item.productId === productId) {
                    return {
                        ...item,
                        quantity: newQuantity,
                        total: newQuantity * item.unitPrice
                    };
                }
                return item;
            }));
        }
    };

    const handleRemoveItem = (productId: string) => {
        setItems(items.filter(item => item.productId !== productId));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSaveClick = () => {
        if (items.length === 0) {
            alert('Debe agregar al menos un producto a la compra');
            return;
        }
        setConfirmModalOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!provider) return;

        try {
            setIsLoading(true);
            setError(null);

            // Preparar datos en el formato del backend
            const compraData = {
                metodoPago: paymentMethod,
                proveedorId: provider.id,
                items: items.map(item => ({
                    cantidad: item.quantity,
                    precioUnitario: item.unitPrice,
                    nombreProducto: item.productName,
                    sku: productSkuMap[item.productId] || ''
                }))
            };

            // Enviar al backend
            await http.post(`/compras/proveedor/${provider.id}`, compraData);

            // Cerrar modales
            setConfirmModalOpen(false);
            onClose();

            // Notificar al padre para recargar los datos del módulo
            onSave();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar la compra');
            setConfirmModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (!provider) return null;

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
                    <Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a' }}>
                            Nueva Compra
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Proveedor: {provider.nombreEmpresa}
                        </Typography>
                    </Box>
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

                        <Box sx={{ display: 'flex', gap: 2, position: 'relative', flexDirection: 'column' }}>
                            <TextField
                                label="Nombre o SKU"
                                placeholder="Buscar producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchKeyPress}
                                fullWidth
                                InputProps={{
                                    startAdornment: <MdSearch size={20} style={{ marginRight: 8, color: '#64748b' }} />,
                                }}
                                helperText="Escribe para buscar automáticamente"
                            />

                            {/* Indicador de carga */}
                            {isSearching && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}

                            {/* Sugerencias en tiempo real */}
                            {!isSearching && searchResults.length > 0 && (
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
                                    {searchResults.map((product) => (
                                        <Box
                                            key={product.id}
                                            onClick={() => {
                                                addProductToPurchase(product);
                                            }}
                                            sx={{
                                                p: 2,
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f1f5f9',
                                                '&:hover': {
                                                    bgcolor: '#f8fafc'
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
                                                        SKU: {product.sku} | Stock actual: {product.stock}
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

                    {/* Detalle de compra */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#0f172a' }}>
                            Detalle de Compra
                        </Typography>

                        {items.length === 0 ? (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 200,
                                bgcolor: '#f8fafc',
                                borderRadius: 3,
                                border: '2px dashed #cbd5e1'
                            }}>
                                <Typography variant="body1" color="text.secondary">
                                    No hay productos agregados. Busque y agregue productos para iniciar la compra.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer
                                component={Paper}
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Cantidad</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Precio Unitario</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.productId}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {item.productName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {item.productId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                            sx={{
                                                                bgcolor: '#fee2e2',
                                                                color: '#dc2626',
                                                                '&:hover': { bgcolor: '#fecaca' }
                                                            }}
                                                        >
                                                            <MdRemove size={16} />
                                                        </IconButton>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight={600}
                                                            sx={{
                                                                minWidth: 40,
                                                                textAlign: 'center',
                                                                bgcolor: '#f8fafc',
                                                                py: 0.5,
                                                                px: 1.5,
                                                                borderRadius: 2
                                                            }}
                                                        >
                                                            {item.quantity}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                            sx={{
                                                                bgcolor: '#dcfce7',
                                                                color: '#16a34a',
                                                                '&:hover': { bgcolor: '#bbf7d0' }
                                                            }}
                                                        >
                                                            <MdAdd size={16} />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={500}>
                                                        ${item.unitPrice.toLocaleString('es-AR')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body1" fontWeight={700} sx={{ color: '#0f172a' }}>
                                                        ${item.total.toLocaleString('es-AR')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveItem(item.productId)}
                                                        sx={{
                                                            color: '#dc2626',
                                                            '&:hover': { bgcolor: '#fee2e2' }
                                                        }}
                                                    >
                                                        <MdDelete size={20} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
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
                                <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                                <MenuItem value="MERCADO_PAGO">Mercado Pago</MenuItem>
                                <MenuItem value="CUENTA_DNI">Cuenta DNI</MenuItem>
                                <MenuItem value="TARJETA_CREDITO">Tarjeta Crédito</MenuItem>
                                <MenuItem value="TARJETA_DEBITO">Tarjeta Débito</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Total de la Compra
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a' }}>
                                ${calculateTotal().toLocaleString('es-AR')}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Mensaje de error */}
                    {error && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#fee2e2', borderRadius: 2, border: '1px solid #ef4444' }}>
                            <Typography variant="body2" color="error">
                                {error}
                            </Typography>
                        </Box>
                    )}
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
                        disabled={items.length === 0 || isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
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
                        {isLoading ? 'Guardando...' : 'Cargar Compra'}
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
                        ¿Confirmar Compra?
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        ¿Está seguro que desea cargar esta compra por un total de <strong>${calculateTotal().toLocaleString('es-AR')}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Esta acción actualizará el stock de los productos automáticamente.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ gap: 1, p: 2 }}>
                    <Button
                        onClick={() => setConfirmModalOpen(false)}
                        variant="outlined"
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmSave}
                        variant="contained"
                        sx={{
                            bgcolor: '#10b981',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: '#059669'
                            }
                        }}
                    >
                        Confirmar y Actualizar Stock
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PurchaseModal;
