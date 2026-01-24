import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, Pagination } from '@mui/material';
import { MdAdd, MdSearch } from 'react-icons/md';
import AddProviderModal from './AddProviderModal';
import EditProviderModal from './EditProviderModal';
import PurchaseModal from './PurchaseModal';
import ProviderCard from './ProviderCard';
import PurchaseHistoryTable from './PurchaseHistoryTable';
import ProveedoresStats from './ProveedoresStats';
import { http } from '../../../shared/api/http';

// Interfaz para la respuesta del backend
interface ProveedorResponse {
    id: number;
    cuit: string;
    activo: boolean;
    nombreEmpresa: string;
    personaContacto: string;
    email: string;
    telefono: string;
    direccion: string;
    totalCompras: number;
    ultimaCompra: string | null;
}

// Tipo para la respuesta paginada del backend
interface PaginatedResponse {
    content: ProveedorResponse[];
    page: {
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
    };
}

export interface Provider {
    id: number;
    nombreEmpresa: string;
    personaContacto: string;
    email: string;
    telefono: string;
    direccion: string;
    cuit: string;
    totalCompras: number;
    ultimaCompra: string | null;
    activo: boolean;
}

export interface Purchase {
    id: string;
    providerId: number;
    providerName: string;
    date: string;
    total: number;
    items: PurchaseItem[];
    status: 'completed' | 'pending' | 'cancelled';
}

export interface PurchaseItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    tipoVenta?: 'UNIDAD' | 'PESO'; // Para saber si se vende por peso o unidad
}

const ITEMS_PER_PAGE = 10;

const ProveedoresContent = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

    // Estados para proveedores
    const [searchInput, setSearchInput] = useState(''); // Valor del input
    const [searchTerm, setSearchTerm] = useState(''); // Valor que dispara la búsqueda
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados de paginación para proveedores
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Trigger para recargar datos
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Estados para historial de compras
    const [purchaseSearchInput, setPurchaseSearchInput] = useState('');
    const [purchaseSearchTerm, setPurchaseSearchTerm] = useState('');

    const [purchaseCurrentPage, setPurchaseCurrentPage] = useState(1);
    const [purchaseTotalPages, setPurchaseTotalPages] = useState(0);
    const [purchaseTotalElements, setPurchaseTotalElements] = useState(0);
    const [purchaseLoading, setPurchaseLoading] = useState(false);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // Cargar proveedores desde el backend con paginación y filtros
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setLoading(true);
                setError(null);

                // Construir los parámetros de la URL
                const params = new URLSearchParams();
                params.append('page', currentPage.toString());
                params.append('size', ITEMS_PER_PAGE.toString());

                // Agregar búsqueda por texto si existe
                if (searchTerm.trim()) {
                    params.append('q', searchTerm.trim());
                }

                // Agregar filtro de estado activo/inactivo
                if (statusFilter === 'active') {
                    params.append('activo', 'true');
                } else if (statusFilter === 'inactive') {
                    params.append('activo', 'false');
                }
                // Si es 'all', no se agrega el parámetro activo

                const response = await http.get<PaginatedResponse>(
                    `/proveedores/filtrar?${params.toString()}`
                );

                // Mapear la respuesta del backend al formato del frontend
                const mappedProviders: Provider[] = (response.data.content || []).map(proveedor => ({
                    id: proveedor.id,
                    nombreEmpresa: proveedor.nombreEmpresa,
                    personaContacto: proveedor.personaContacto,
                    email: proveedor.email,
                    telefono: proveedor.telefono,
                    direccion: proveedor.direccion,
                    cuit: proveedor.cuit,
                    totalCompras: proveedor.totalCompras,
                    ultimaCompra: proveedor.ultimaCompra,
                    activo: proveedor.activo
                }));

                setProviders(mappedProviders);
                setTotalPages(response.data.page.totalPages);
                setTotalElements(response.data.page.totalElements);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al cargar los proveedores');
                setProviders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [currentPage, searchTerm, statusFilter, refreshTrigger]);

    // Estados para estadísticas
    const [statsTotalProveedores, setStatsTotalProveedores] = useState(0);
    const [statsProveedoresActivos, setStatsProveedoresActivos] = useState(0);
    const [statsTotalGastado, setStatsTotalGastado] = useState(0);

    // Cargar estadísticas
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await http.get<{
                    totalProveedores: number;
                    proveedoresActivos: number;
                    totalGastado: number;
                }>('/proveedores/stats');

                setStatsTotalProveedores(response.data.totalProveedores);
                setStatsProveedoresActivos(response.data.proveedoresActivos);
                setStatsTotalGastado(response.data.totalGastado); //Total gastado del mes
            } catch (err) {

            }
        };

        fetchStats();
    }, [providers, refreshTrigger]);

    // Cargar historial de compras con paginación y filtros
    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                setPurchaseLoading(true);

                // Construir los parámetros de la URL
                const params = new URLSearchParams();
                params.append('page', purchaseCurrentPage.toString());
                params.append('size', ITEMS_PER_PAGE.toString());

                // Agregar búsqueda por proveedor si existe
                if (purchaseSearchTerm.trim()) {
                    params.append('q', purchaseSearchTerm.trim());
                }

                // Determinar si hay filtros activos
                const hasFilters = purchaseSearchTerm.trim();

                // Usar /compras/filtrar solo si hay filtros, sino usar /compras
                const endpoint = hasFilters ? '/compras/filtrar' : '/compras';

                const response = await http.get<any>(`${endpoint}?${params.toString()}`);

                // Cada elemento del content es una compra completa
                // Los items de la compra están en el array 'detalles'
                const mappedPurchases: Purchase[] = (response.data.content || []).map((compra: any) => {

                    // Mapear los detalles (items) de la compra
                    const mappedItems = (compra.detalles || []).map((detalle: any) => ({
                        productId: String(detalle.productoId || ''),
                        productName: detalle.nombreProducto || 'Producto',
                        quantity: detalle.cantidad || 0,
                        unitPrice: detalle.precioUnitario || 0,
                        total: (detalle.cantidad || 0) * (detalle.precioUnitario || 0),
                        tipoVenta: detalle.tipoVenta
                    }));

                    return {
                        id: String(compra.id),
                        providerId: compra.proveedor?.id || 0,
                        providerName: compra.nombreProveedor || 'Proveedor desconocido',
                        date: compra.fechaHora || new Date().toISOString(),
                        total: compra.total || mappedItems.reduce((sum: number, item: any) => sum + item.total, 0),
                        items: mappedItems,
                        status: 'completed'
                    };
                });

                setPurchases(mappedPurchases);
                setPurchaseTotalPages(response.data.page.totalPages);
                setPurchaseTotalElements(response.data.page.totalElements);
            } catch (err: any) {
                setPurchases([]);
            } finally {
                setPurchaseLoading(false);
            }
        };

        fetchPurchases();
    }, [purchaseCurrentPage, purchaseSearchTerm, refreshTrigger]);

    const handleAddProvider = () => {
        // Volver a la página 1 para ver el nuevo proveedor
        if (currentPage === 1) {
            setRefreshTrigger(prev => prev + 1);
        } else {
            setCurrentPage(1);
        }
    };

    const handleEditProvider = () => {
        // Recargar la página actual
        setRefreshTrigger(prev => prev + 1);
    };

    const handleInitiatePurchase = (provider: Provider) => {
        setSelectedProvider(provider);
        setPurchaseModalOpen(true);
    };

    const handleSavePurchase = () => {
        // Recargar proveedores y estadísticas después de guardar una compra
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEdit = (provider: Provider) => {
        setSelectedProvider(provider);
        setEditModalOpen(true);
    };


    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a', mb: 1 }}>
                        Gestión de Proveedores
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra tus proveedores y compras
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
                    Agregar Proveedor
                </Button>
            </Box>

            {/* Stats */}
            <ProveedoresStats
                totalProviders={statsTotalProveedores}
                activeProviders={statsProveedoresActivos}
                totalSpent={statsTotalGastado}
            />

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                    placeholder="Buscar por nombre, contacto, email o CUIT... (presione Enter)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setSearchTerm(searchInput);
                        }
                    }}
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: <MdSearch size={20} style={{ marginRight: 8, color: '#64748b' }} />,
                    }}
                    helperText={searchTerm ? `Buscando: "${searchTerm}"` : 'Presiona Enter para buscar'}
                />
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Estado"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="all">Todos</MenuItem>
                        <MenuItem value="active">Activos</MenuItem>
                        <MenuItem value="inactive">Inactivos</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Provider Cards */}
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3 }}>
                Proveedores ({providers.length})
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={48} />
                </Box>
            ) : (
                <>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                        gap: 3,
                        mb: 4
                    }}>
                        {providers.map((provider) => (
                            <ProviderCard
                                key={provider.id}
                                provider={provider}
                                onInitiatePurchase={handleInitiatePurchase}
                                onEdit={handleEdit}
                            />
                        ))}
                    </Box>

                    {providers.length === 0 && !loading && (
                        <Box sx={{
                            textAlign: 'center',
                            py: 8,
                            bgcolor: '#f8fafc',
                            borderRadius: 3,
                            border: '2px dashed #cbd5e1'
                        }}>
                            <Typography variant="body1" color="text.secondary">
                                No se encontraron proveedores
                            </Typography>
                        </Box>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(_event, page) => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
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

            {/* Purchase History */}
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3, mt: 5 }}>
                Historial de Compras ({purchases.length})
            </Typography>

            {/* Filtros de compras */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Buscar por proveedor... (presione Enter)"
                    value={purchaseSearchInput}
                    onChange={(e) => setPurchaseSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setPurchaseSearchTerm(purchaseSearchInput);
                            setPurchaseCurrentPage(1);
                        }
                    }}
                    sx={{ flex: 1, minWidth: 250 }}
                    InputProps={{
                        startAdornment: <MdSearch size={20} style={{ marginRight: 8, color: '#64748b' }} />,
                    }}
                    helperText={purchaseSearchTerm ? `Buscando: "${purchaseSearchTerm}"` : 'Presiona Enter para buscar'}
                />

            </Box>

            {purchaseLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={48} />
                </Box>
            ) : (
                <>
                    <PurchaseHistoryTable purchases={purchases} />

                    {/* Paginación de compras */}
                    {purchaseTotalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={purchaseTotalPages}
                                page={purchaseCurrentPage}
                                onChange={(_event, page) => {
                                    setPurchaseCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
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

            {/* Modals */}
            <AddProviderModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAddProvider}
            />

            <EditProviderModal
                open={editModalOpen}
                provider={selectedProvider}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedProvider(null);
                }}
                onSave={handleEditProvider}
            />

            <PurchaseModal
                open={purchaseModalOpen}
                provider={selectedProvider}
                onClose={() => {
                    setPurchaseModalOpen(false);
                    setSelectedProvider(null);
                }}
                onSave={handleSavePurchase}
            />
        </Box>
    );
};

export default ProveedoresContent;
