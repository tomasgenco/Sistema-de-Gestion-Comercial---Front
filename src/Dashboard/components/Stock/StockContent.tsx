import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Pagination, CircularProgress } from '@mui/material';
import { MdAdd, MdSearch } from 'react-icons/md';
import ProductTable, { type Product } from './ProductTable';
import EditProductModal from './EditProductModal';
import AddProductModal from './AddProductModal';
import StockStats from './StockStats';
import { http } from '../../../shared/api/http';

// Función para determinar el estado del producto basado en stock
const getProductStatus = (stock: number): 'available' | 'low' | 'out' => {
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'available';
};

// Tipo de dato que viene del backend
interface ProductoAPI {
    id: number;
    nombre: string;
    precio: number;
    sku: string;
    stock: number;
}

// Tipo para la respuesta paginada del backend
interface PaginatedResponse {
    content: ProductoAPI[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// Tipo para la respuesta de estadísticas del backend
interface StatsResponse {
    totalProductos: number;
    productosStockBajo: number;
    productosSinStock: number;
    valorTotalInventario: number;
}

const ITEMS_PER_PAGE = 10;

const StockContent = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState(''); // Término de búsqueda activo
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger para forzar refresh

    // Estados para estadísticas
    const [totalProductsFromServer, setTotalProductsFromServer] = useState(0);
    const [lowStockProducts, setLowStockProducts] = useState(0);
    const [outOfStockProducts, setOutOfStockProducts] = useState(0);
    const [totalValue, setTotalValue] = useState(0);

    // Cargar productos desde el backend con paginación o búsqueda
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Si hay búsqueda activa, usar endpoint de búsqueda
                if (activeSearch.trim()) {
                    // El endpoint de búsqueda retorna una lista simple, no paginada
                    const response = await http.get<ProductoAPI[]>(
                        `/producto/search?q=${encodeURIComponent(activeSearch)}`
                    );

                    // Validar que response.data sea un array
                    const dataArray = Array.isArray(response.data) ? response.data : [];

                    // Transformar los datos del backend al formato del frontend
                    let productosFormateados: Product[] = dataArray.map(producto => ({
                        id: String(producto.id),
                        name: producto.nombre,
                        barcode: producto.sku,
                        price: producto.precio,
                        stock: producto.stock,
                        status: getProductStatus(producto.stock)
                    }));

                    // Aplicar filtro de estado si no es 'all'
                    if (statusFilter !== 'all') {
                        productosFormateados = productosFormateados.filter(p => p.status === statusFilter);
                    }

                    // Paginar en el frontend
                    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                    const endIndex = startIndex + ITEMS_PER_PAGE;
                    const paginatedProducts = productosFormateados.slice(startIndex, endIndex);

                    setProducts(paginatedProducts);
                    setTotalPages(Math.ceil(productosFormateados.length / ITEMS_PER_PAGE));
                } else if (statusFilter !== 'all') {
                    // Si hay filtro de estado activo, obtener más productos para filtrar correctamente
                    // Usamos size=100 para obtener suficientes productos (ajustar según el tamaño de tu catálogo)
                    const response = await http.get<PaginatedResponse>(
                        `/producto/paginated?page=1&size=100`
                    );

                    // Transformar y filtrar
                    let productosFormateados: Product[] = (response.data.content || []).map(producto => ({
                        id: String(producto.id),
                        name: producto.nombre,
                        barcode: producto.sku,
                        price: producto.precio,
                        stock: producto.stock,
                        status: getProductStatus(producto.stock)
                    }));

                    // Aplicar filtro de estado
                    productosFormateados = productosFormateados.filter(p => p.status === statusFilter);

                    // Paginar en el frontend
                    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                    const endIndex = startIndex + ITEMS_PER_PAGE;
                    const paginatedProducts = productosFormateados.slice(startIndex, endIndex);

                    setProducts(paginatedProducts);
                    setTotalPages(Math.ceil(productosFormateados.length / ITEMS_PER_PAGE));
                } else {
                    // Si no hay búsqueda ni filtro, usar endpoint paginado normal del backend
                    const response = await http.get<PaginatedResponse>(
                        `/producto/paginated?page=${currentPage}&size=${ITEMS_PER_PAGE}`
                    );

                    // Transformar los datos del backend al formato del frontend
                    const productosFormateados: Product[] = (response.data.content || []).map(producto => ({
                        id: String(producto.id),
                        name: producto.nombre,
                        barcode: producto.sku,
                        price: producto.precio,
                        stock: producto.stock,
                        status: getProductStatus(producto.stock)
                    }));

                    setProducts(productosFormateados);
                    setTotalPages(response.data.totalPages);
                }
            } catch (err: any) {
                setError('Error al cargar los productos');
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductos();
    }, [currentPage, activeSearch, statusFilter, refreshTrigger]); // Agregar refreshTrigger para forzar recarga

    // Cargar estadísticas desde el backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await http.get<StatsResponse>('/producto/stats');
                setTotalProductsFromServer(response.data.totalProductos);
                setLowStockProducts(response.data.productosStockBajo);
                setOutOfStockProducts(response.data.productosSinStock);
                setTotalValue(response.data.valorTotalInventario);
            } catch (err: any) {
                // Si falla, mantener valores en 0
                setTotalProductsFromServer(0);
                setLowStockProducts(0);
                setOutOfStockProducts(0);
                setTotalValue(0);
            }
        };

        fetchStats();
    }, [refreshTrigger]); // Recargar estadísticas cuando cambia el trigger



    // Función para ejecutar la búsqueda (al presionar Enter)
    const handleSearch = () => {
        setActiveSearch(searchTerm);
        setCurrentPage(1); // Volver a la primera página al buscar
    };

    // Limpiar búsqueda cuando se borra el texto
    useEffect(() => {
        if (searchTerm === '') {
            setActiveSearch('');
            setCurrentPage(1);
        }
    }, [searchTerm]);

    // Resetear a página 1 cuando cambia el filtro de estado
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        // Scroll suave hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const handleAdd = () => {
        // Volver a la página 1 y forzar la recarga de datos y estadísticas
        setCurrentPage(1);
        setRefreshTrigger(prev => prev + 1); // Incrementar trigger para forzar refresh
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
            {/* Stats */}
            <StockStats
                totalProducts={totalProductsFromServer}
                lowStockProducts={lowStockProducts}
                outOfStockProducts={outOfStockProducts}
                totalValue={totalValue}
            />

            {/* Filters and Search */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                    placeholder="Buscar por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
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
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a' }}>
                    Lista de Productos ({products.length})
                </Typography>

            </Box>

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
            ) : error ? (
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
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{
                            bgcolor: '#0f172a',
                            '&:hover': { bgcolor: '#1e293b' }
                        }}
                    >
                        Reintentar
                    </Button>
                </Box>
            ) : (
                <>
                    <ProductTable
                        products={products}
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
                                showFirstButton
                                showLastButton
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
