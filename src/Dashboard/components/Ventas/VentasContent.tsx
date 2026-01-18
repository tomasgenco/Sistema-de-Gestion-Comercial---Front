import { useState, useEffect } from 'react';
import { Box, Typography, Button, Pagination, CircularProgress, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { MdAdd, MdSearch } from 'react-icons/md';
import SaleModal from '../Ventas/SaleModal';
import SalesSearchTable from '../Ventas/SalesSearchTable';
import VentasStats from '../Ventas/VentasStats';
import { http } from '../../../shared/api/http';

export interface Sale {
    id: string;
    date: string;
    paymentMethod: 'efectivo' | 'mercadopago' | 'cuentadni' | 'tarjetacredito' | 'tarjetadebito';
    total: number;
    items: SaleItem[];
}

export interface SaleItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    maxStock?: number; // Para validación local sin ir al servidor
}

// Tipo de dato que viene del backend
interface VentaAPI {
    id: number;
    fechaHora: string;
    metodoPago: string;
    total: number;
    detalles: DetalleVentaAPI[];
}

interface DetalleVentaAPI {
    id: number;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
}

// Tipo para la respuesta paginada del backend
interface PaginatedResponse {
    content: VentaAPI[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

const ITEMS_PER_PAGE = 10;

// Mapear método de pago del backend al frontend
const mapPaymentMethod = (metodoPago: string): Sale['paymentMethod'] => {
    const map: Record<string, Sale['paymentMethod']> = {
        'EFECTIVO': 'efectivo',
        'MERCADO_PAGO': 'mercadopago',
        'CUENTA_DNI': 'cuentadni',
        'TARJETA_CREDITO': 'tarjetacredito',
        'TARJETA_DEBITO': 'tarjetadebito'
    };
    return map[metodoPago] || 'efectivo';
};

const VentasContent = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [saleModalOpen, setSaleModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Estados para búsqueda (valores temporales en los inputs)
    const [searchPaymentMethod, setSearchPaymentMethod] = useState<string>('');
    const [searchDate, setSearchDate] = useState<string>('');

    // Estados para búsqueda activa (valores que se usan en la petición)
    const [activePaymentMethod, setActivePaymentMethod] = useState<string>('');
    const [activeSearchDate, setActiveSearchDate] = useState<string>('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    // Función para convertir método de pago del frontend al backend
    const convertPaymentMethodToBackend = (method: string): string => {
        const map: Record<string, string> = {
            'efectivo': 'EFECTIVO',
            'mercadopago': 'MERCADO PAGO',
            'cuentadni': 'CUENTA DNI',
            'tarjetacredito': 'TARJETA CREDITO',
            'tarjetadebito': 'TARJETA DEBITO'
        };
        return map[method] || method;
    };

    // Cargar ventas desde el backend con paginación o búsqueda
    useEffect(() => {
        const fetchVentas = async () => {
            try {
                setIsLoading(true);
                setError(null);

                let ventasFormateadas: Sale[] = [];
                let totalPagesResult = 0;

                // Si hay búsqueda activa
                if (isSearchActive && (activePaymentMethod || activeSearchDate)) {
                    const params = new URLSearchParams();
                    if (activePaymentMethod) {
                        // Convertir al formato del backend
                        const backendMethod = convertPaymentMethodToBackend(activePaymentMethod);
                        params.append('q', backendMethod);
                    }
                    if (activeSearchDate) params.append('fecha', activeSearchDate);

                    const response = await http.get<VentaAPI[]>(`/ventas/search?${params.toString()}`);

                    // Transformar datos
                    const allVentas = (response.data || []).map(venta => ({
                        id: String(venta.id),
                        date: venta.fechaHora,
                        paymentMethod: mapPaymentMethod(venta.metodoPago),
                        total: venta.total,
                        items: (venta.detalles || []).map(detalle => ({
                            productId: String(detalle.id),
                            productName: detalle.nombreProducto,
                            quantity: detalle.cantidad,
                            unitPrice: detalle.precioUnitario,
                            total: detalle.cantidad * detalle.precioUnitario
                        }))
                    }));

                    // Paginar en el frontend
                    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                    const endIndex = startIndex + ITEMS_PER_PAGE;
                    ventasFormateadas = allVentas.slice(startIndex, endIndex);
                    totalPagesResult = Math.ceil(allVentas.length / ITEMS_PER_PAGE);
                } else {
                    // Sin búsqueda, usar paginación normal
                    const response = await http.get<PaginatedResponse>(
                        `/ventas/paginated?page=${currentPage}&size=${ITEMS_PER_PAGE}`
                    );

                    ventasFormateadas = (response.data.content || []).map(venta => ({
                        id: String(venta.id),
                        date: venta.fechaHora,
                        paymentMethod: mapPaymentMethod(venta.metodoPago),
                        total: venta.total,
                        items: (venta.detalles || []).map(detalle => ({
                            productId: String(detalle.id),
                            productName: detalle.nombreProducto,
                            quantity: detalle.cantidad,
                            unitPrice: detalle.precioUnitario,
                            total: detalle.cantidad * detalle.precioUnitario
                        }))
                    }));

                    totalPagesResult = response.data.totalPages;
                }

                setSales(ventasFormateadas);
                setTotalPages(totalPagesResult);
            } catch (err: any) {
                setError('Error al cargar las ventas');
                setSales([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVentas();
    }, [currentPage, refreshTrigger, isSearchActive, activePaymentMethod, activeSearchDate]);

    // Estados para estadísticas
    const [todayCount, setTodayCount] = useState(0);
    const [todayTotal, setTodayTotal] = useState(0);
    const [averageSale, setAverageSale] = useState(0);

    // Cargar estadísticas desde el backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await http.get<{
                    ventasDelMes: number;
                    ingresosTotalesDelDia: number;
                    egresosDelDia: number;
                    ventasDelDia: number;
                }>('/ventas/stats');

                setTodayCount(response.data.ventasDelDia);
                setTodayTotal(response.data.ingresosTotalesDelDia);
                setAverageSale(response.data.ventasDelMes > 0 ? response.data.ingresosTotalesDelDia / response.data.ventasDelDia : 0); //promedio del dia
            } catch (err: any) {
                // Si falla, mantener valores en 0
                setTodayCount(0);
                setTodayTotal(0);
                setAverageSale(0);
            }
        };

        fetchStats();
    }, [refreshTrigger]); // Recargar cuando se agrega una nueva venta

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddSale = () => {
        // Si estamos en la página 1, forzamos recarga. Si no, vamos a la página 1 (que disparará carga)
        if (currentPage === 1) {
            setRefreshTrigger(prev => prev + 1);
        } else {
            setCurrentPage(1);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a', mb: 1 }}>
                        Gestión de Ventas
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra tus ventas y transacciones
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<MdAdd size={20} />}
                    onClick={() => setSaleModalOpen(true)}
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
                    Iniciar Venta
                </Button>
            </Box>

            {/* Stats */}
            <VentasStats
                todayCount={todayCount}
                todayTotal={todayTotal}
                averageSale={averageSale}
            />

            {/* Search Section */}
            <Box sx={{ mb: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', mb: 2 }}>
                    Buscar Ventas
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 2, alignItems: 'end' }}>
                    <FormControl fullWidth>
                        <InputLabel>Método de Pago</InputLabel>
                        <Select
                            value={searchPaymentMethod}
                            label="Método de Pago"
                            onChange={(e) => setSearchPaymentMethod(e.target.value)}
                            sx={{ bgcolor: 'white' }}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="efectivo">Efectivo</MenuItem>
                            <MenuItem value="mercadopago">Mercado Pago</MenuItem>
                            <MenuItem value="cuentadni">Cuenta DNI</MenuItem>
                            <MenuItem value="tarjetacredito">Tarjeta de Crédito</MenuItem>
                            <MenuItem value="tarjetadebito">Tarjeta de Débito</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        type="date"
                        label="Fecha"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ bgcolor: 'white' }}
                    />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<MdSearch />}
                            onClick={() => {
                                setActivePaymentMethod(searchPaymentMethod);
                                setActiveSearchDate(searchDate);
                                setIsSearchActive(true);
                                setCurrentPage(1);
                            }}
                            disabled={!searchPaymentMethod && !searchDate}
                            sx={{
                                bgcolor: '#0f172a',
                                '&:hover': { bgcolor: '#1e293b' },
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3
                            }}
                        >
                            Buscar
                        </Button>
                        {isSearchActive && (
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSearchPaymentMethod('');
                                    setSearchDate('');
                                    setActivePaymentMethod('');
                                    setActiveSearchDate('');
                                    setIsSearchActive(false);
                                    setCurrentPage(1);
                                }}
                                sx={{
                                    borderColor: '#0f172a',
                                    color: '#0f172a',
                                    '&:hover': { borderColor: '#1e293b', bgcolor: '#f1f5f9' },
                                    textTransform: 'none',
                                    fontWeight: 600
                                }}
                            >
                                Limpiar
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Sales Table */}
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3 }}>
                Historial de Ventas ({sales.length})
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
                        Cargando ventas...
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
                    <SalesSearchTable sales={sales} />

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

            {/* Sale Modal */}
            <SaleModal
                open={saleModalOpen}
                onClose={() => setSaleModalOpen(false)}
                onSave={handleAddSale}
            />
        </Box>
    );
};

export default VentasContent;
