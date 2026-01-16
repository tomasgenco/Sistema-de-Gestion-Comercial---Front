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
    Paper
} from '@mui/material';
import { MdClose, MdSearch, MdAdd, MdRemove, MdDelete } from 'react-icons/md';
import type { Provider, Purchase, PurchaseItem } from './ProveedoresContent';

interface PurchaseModalProps {
    open: boolean;
    provider: Provider | null;
    onClose: () => void;
    onSave: (purchase: Omit<Purchase, 'id'>) => void;
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

const PurchaseModal = ({ open, provider, onClose, onSave }: PurchaseModalProps) => {
    const [items, setItems] = useState<PurchaseItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setItems([]);
            setSearchTerm('');
            setConfirmModalOpen(false);
        }
    }, [open]);

    const handleSearchKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddProduct();
        }
    };

    const handleAddProduct = () => {
        if (!searchTerm.trim()) return;

        const product = mockProducts.find(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode === searchTerm.trim()
        );

        if (product) {
            addProductToPurchase(product);
            setSearchTerm('');
        } else {
            alert('Producto no encontrado');
        }
    };

    const addProductToPurchase = (product: typeof mockProducts[0]) => {
        const existingItemIndex = items.findIndex(item => item.productId === product.id);

        if (existingItemIndex >= 0) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += 1;
            newItems[existingItemIndex].total = newItems[existingItemIndex].quantity * newItems[existingItemIndex].unitPrice;
            setItems(newItems);
        } else {
            const newItem: PurchaseItem = {
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

    const handleConfirmSave = () => {
        if (!provider) return;

        const purchase: Omit<Purchase, 'id'> = {
            providerId: provider.id,
            providerName: provider.name,
            date: new Date().toISOString(),
            total: calculateTotal(),
            items,
            status: 'completed'
        };

        onSave(purchase);
        setConfirmModalOpen(false);
        onClose();
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
                            Proveedor: {provider.name}
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
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Nombre o Código de Barras"
                                    placeholder="Buscar producto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleSearchKeyPress}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <MdSearch size={20} style={{ marginRight: 8, color: '#64748b' }} />
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleAddProduct}
                                    sx={{ minWidth: 120 }}
                                >
                                    Agregar
                                </Button>
                            </Box>

                            {/* Sugerencias en tiempo real */}
                            {searchTerm.trim().length > 0 && (
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
                                        .filter(p =>
                                            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            p.barcode.includes(searchTerm)
                                        )
                                        .slice(0, 5)
                                        .map((product) => (
                                            <Box
                                                key={product.id}
                                                onClick={() => {
                                                    addProductToPurchase(product);
                                                    setSearchTerm('');
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
                                                            {product.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ID: {product.id} | Stock actual: {product.stock}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>
                                                        ${product.price.toLocaleString('es-AR')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    {mockProducts.filter(p =>
                                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.barcode.includes(searchTerm)
                                    ).length === 0 && (
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

                    {/* Total */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        bgcolor: '#f8fafc',
                        p: 3,
                        borderRadius: 3,
                        border: '2px solid #e2e8f0'
                    }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Total de la Compra
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
                        Cargar Compra
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
