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
    Divider
} from '@mui/material';
import { MdClose, MdSearch, MdQrCodeScanner } from 'react-icons/md';
import type { Sale, SaleItem } from './VentasContent';
import SaleDetailTable from '../Ventas/SaleDetailTable';

interface SaleModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (sale: Omit<Sale, 'id'>) => void;
}

// Mock products (mismos que en Stock)
const mockProducts = [
    { id: 'P-001', name: 'Laptop Dell XPS 15', barcode: '7891234567890', price: 1250000, stock: 15 },
    { id: 'P-002', name: 'Mouse Logitech MX Master', barcode: '7891234567891', price: 85000, stock: 45 },
    { id: 'P-003', name: 'Teclado Mecánico RGB', barcode: '7891234567892', price: 120000, stock: 3 },
    { id: 'P-004', name: 'Monitor Samsung 27"', barcode: '7891234567893', price: 350000, stock: 0 },
    { id: 'P-005', name: 'Webcam Logitech C920', barcode: '7891234567894', price: 95000, stock: 22 },
    { id: 'P-006', name: 'Auriculares Sony WH-1000XM4', barcode: '7891234567895', price: 280000, stock: 12 },
    { id: 'P-007', name: 'SSD Samsung 1TB', barcode: '7891234567896', price: 125000, stock: 5 },
    { id: 'P-008', name: 'RAM Corsair 16GB', barcode: '7891234567897', price: 75000, stock: 30 },
    { id: 'P-009', name: 'Procesador Intel i7', barcode: '7891234567898', price: 450000, stock: 8 },
    { id: 'P-010', name: 'Placa de Video RTX 3060', barcode: '7891234567899', price: 650000, stock: 4 },
];

const SaleModal = ({ open, onClose, onSave }: SaleModalProps) => {
    const [items, setItems] = useState<SaleItem[]>([]);
    const [searchByName, setSearchByName] = useState('');
    const [searchByBarcode, setSearchByBarcode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'mercadopago' | 'cuentadni' | 'tarjetacredito' | 'tarjetadebito'>('efectivo');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const lastInputTimeRef = useRef<number>(0);
    const barcodeBufferRef = useRef<string>('');

    // Limpiar formulario al abrir/cerrar
    useEffect(() => {
        if (open) {
            setItems([]);
            setSearchByName('');
            setSearchByBarcode('');
            setPaymentMethod('efectivo');
            setConfirmModalOpen(false);
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

    const handleBarcodeKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddByBarcode();
        }
    };

    const handleAddByBarcode = () => {
        if (!searchByBarcode.trim()) return;

        const product = mockProducts.find(p => p.barcode === searchByBarcode.trim());

        if (product) {
            if (product.stock === 0) {
                alert('Producto sin stock disponible');
                setSearchByBarcode('');
                return;
            }

            addProductToSale(product);
            setSearchByBarcode('');
            // Mantener el foco en el input de código de barras
            barcodeInputRef.current?.focus();
        } else {
            alert('Código de barras no encontrado');
            setSearchByBarcode('');
        }
    };

    const handleAddByName = () => {
        if (!searchByName.trim()) return;

        const product = mockProducts.find(p =>
            p.name.toLowerCase().includes(searchByName.toLowerCase())
        );

        if (product) {
            if (product.stock === 0) {
                alert('Producto sin stock disponible');
                setSearchByName('');
                return;
            }

            addProductToSale(product);
            setSearchByName('');
        } else {
            alert('Producto no encontrado');
            setSearchByName('');
        }
    };

    const addProductToSale = (product: typeof mockProducts[0]) => {
        const existingItemIndex = items.findIndex(item => item.productId === product.id);

        if (existingItemIndex >= 0) {
            // Si ya existe, aumentar cantidad
            const newItems = [...items];
            const currentQuantity = newItems[existingItemIndex].quantity;

            // Verificar stock disponible
            if (currentQuantity >= product.stock) {
                alert(`Stock máximo alcanzado (${product.stock} unidades)`);
                return;
            }

            newItems[existingItemIndex].quantity += 1;
            newItems[existingItemIndex].total = newItems[existingItemIndex].quantity * newItems[existingItemIndex].unitPrice;
            setItems(newItems);
        } else {
            // Si no existe, agregar nuevo item
            const newItem: SaleItem = {
                productId: product.id,
                productName: product.name,
                quantity: 1,
                unitPrice: product.price,
                total: product.price
            };
            setItems([...items, newItem]);
        }
    };

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        const product = mockProducts.find(p => p.id === productId);

        if (!product) return;

        if (newQuantity > product.stock) {
            alert(`Stock máximo: ${product.stock} unidades`);
            return;
        }

        if (newQuantity <= 0) {
            // Eliminar item si la cantidad es 0 o menor
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
            alert('Debe agregar al menos un producto a la venta');
            return;
        }
        setConfirmModalOpen(true);
    };

    const handleConfirmSave = () => {
        const sale: Omit<Sale, 'id'> = {
            date: new Date().toISOString(),
            paymentMethod,
            total: calculateTotal(),
            items
        };

        onSave(sale);
        setConfirmModalOpen(false);
        onClose();
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
                            {searchByName.trim().length > 0 && (
                                <Box
                                    sx={{
                                        bgcolor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 2,
                                        maxHeight: 200,
                                        overflow: 'auto',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {mockProducts
                                        .filter(p => p.name.toLowerCase().includes(searchByName.toLowerCase()))
                                        .slice(0, 5)
                                        .map((product) => (
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
                                                            {product.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ID: {product.id} | Stock: {product.stock}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>
                                                        ${product.price.toLocaleString('es-AR')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    {mockProducts.filter(p => p.name.toLowerCase().includes(searchByName.toLowerCase())).length === 0 && (
                                        <Box sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No se encontraron productos
                                            </Typography>
                                        </Box>
                                    )}
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
                    <Typography variant="body1" color="text.secondary">
                        ¿Está seguro que desea guardar esta venta por un total de <strong>${calculateTotal().toLocaleString('es-AR')}</strong>?
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
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SaleModal;
