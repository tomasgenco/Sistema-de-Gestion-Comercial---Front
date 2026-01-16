import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Pagination, CircularProgress } from '@mui/material';
import { MdAdd, MdSearch } from 'react-icons/md';
import ProductTable, { type Product } from './ProductTable';
import EditProductModal from './EditProductModal';
import AddProductModal from './AddProductModal';
import StockStats from './StockStats';

// Función para determinar el estado del producto basado en stock
const getProductStatus = (stock: number): 'available' | 'low' | 'out' => {
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'available';
};

// Datos de ejemplo (mock data)
const initialProducts: Product[] = [
    { id: 'P-001', name: 'Laptop Dell XPS 15', barcode: '7891234567890', price: 1250000, stock: 15, status: 'available' },
    { id: 'P-002', name: 'Mouse Logitech MX Master', barcode: '7891234567891', price: 85000, stock: 45, status: 'available' },
    { id: 'P-003', name: 'Teclado Mecánico RGB', barcode: '7891234567892', price: 120000, stock: 3, status: 'low' },
    { id: 'P-004', name: 'Monitor Samsung 27"', barcode: '7891234567893', price: 350000, stock: 0, status: 'out' },
    { id: 'P-005', name: 'Webcam Logitech C920', barcode: '7891234567894', price: 95000, stock: 22, status: 'available' },
    { id: 'P-006', name: 'Auriculares Sony WH-1000XM4', barcode: '7891234567895', price: 280000, stock: 12, status: 'available' },
    { id: 'P-007', name: 'SSD Samsung 1TB', barcode: '7891234567896', price: 125000, stock: 5, status: 'low' },
    { id: 'P-008', name: 'RAM Corsair 16GB', barcode: '7891234567897', price: 75000, stock: 30, status: 'available' },
    { id: 'P-009', name: 'Procesador Intel i7', barcode: '7891234567898', price: 450000, stock: 8, status: 'available' },
    { id: 'P-010', name: 'Placa de Video RTX 3060', barcode: '7891234567899', price: 650000, stock: 4, status: 'low' },
    { id: 'P-011', name: 'Motherboard ASUS ROG', barcode: '7891234567900', price: 320000, stock: 6, status: 'available' },
    { id: 'P-012', name: 'Fuente Corsair 750W', barcode: '7891234567901', price: 180000, stock: 12, status: 'available' },
    { id: 'P-013', name: 'Gabinete NZXT H510', barcode: '7891234567902', price: 95000, stock: 2, status: 'low' },
    { id: 'P-014', name: 'Cooler Noctua NH-D15', barcode: '7891234567903', price: 125000, stock: 18, status: 'available' },
    { id: 'P-015', name: 'Pasta Térmica Arctic MX-4', barcode: '7891234567904', price: 8500, stock: 50, status: 'available' },
];


const ITEMS_PER_PAGE = 10;

const StockContent = () => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Filtrar y buscar productos (por nombre O código de barra)
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Filtro de búsqueda (nombre o código de barra)
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                product.name.toLowerCase().includes(searchLower) ||
                product.barcode.includes(searchTerm);

            // Filtro de estado
            const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [products, searchTerm, statusFilter]);

    // Calcular paginación
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Calcular estadísticas
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.status === 'low' || p.status === 'out').length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setIsLoading(true);
        setCurrentPage(page);

        // Simular carga de datos (animación)
        setTimeout(() => {
            setIsLoading(false);
            // Scroll suave hacia arriba
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500); // 500ms de animación de carga
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setEditModalOpen(true);
    };

    const handleSave = (updatedProduct: Product) => {
        setProducts(products.map(p => {
            if (p.id === updatedProduct.id) {
                // Actualizar el estado basado en el nuevo stock
                return {
                    ...updatedProduct,
                    status: getProductStatus(updatedProduct.stock)
                };
            }
            return p;
        }));
    };

    const handleAdd = (newProductData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...newProductData,
            id: `P-${String(products.length + 1).padStart(3, '0')}`,
            status: getProductStatus(newProductData.stock)
        };
        setProducts([...products, newProduct]);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedProduct(null);
    };

    const handleCloseAddModal = () => {
        setAddModalOpen(false);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a', mb: 1 }}>
                        Gestión de Stock
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra tu inventario de productos
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<MdAdd size={20} />}
                    onClick={() => setAddModalOpen(true)}
                    sx={{
                        bgcolor: '#0f172a',
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        '&:hover': {
                            bgcolor: '#1e293b'
                        }
                    }}
                >
                    Agregar Producto
                </Button>
            </Box>

            {/* Stats */}
            <StockStats
                totalProducts={totalProducts}
                lowStockProducts={lowStockProducts}
                totalValue={totalValue}
            />

            {/* Filters and Search */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                    placeholder="Buscar por nombre o código de barra..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: <MdSearch size={20} style={{ marginRight: 8, color: '#64748b' }} />,
                    }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Estado"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="all">Todos</MenuItem>
                        <MenuItem value="available">Disponible</MenuItem>
                        <MenuItem value="low">Stock Bajo</MenuItem>
                        <MenuItem value="out">Sin Stock</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Products Table */}
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3 }}>
                Lista de Productos ({filteredProducts.length})
            </Typography>

            {/* Loading Animation */}
            {isLoading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 400,
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <CircularProgress size={60} sx={{ color: '#0f172a' }} />
                    <Typography variant="body1" color="text.secondary">
                        Cargando productos...
                    </Typography>
                </Box>
            ) : (
                <>
                    <ProductTable
                        products={paginatedProducts}
                        onEdit={handleEdit}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontWeight: 600,
                                        borderRadius: 2,
                                    },
                                    '& .Mui-selected': {
                                        bgcolor: '#0f172a !important',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: '#1e293b !important',
                                        }
                                    }
                                }}
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Edit Modal */}
            <EditProductModal
                open={editModalOpen}
                product={selectedProduct}
                onClose={handleCloseEditModal}
                onSave={handleSave}
            />

            {/* Add Modal */}
            <AddProductModal
                open={addModalOpen}
                onClose={handleCloseAddModal}
                onAdd={handleAdd}
            />
        </Box>
    );
};

export default StockContent;
