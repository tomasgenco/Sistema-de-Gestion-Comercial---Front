import { useState, useEffect } from 'react';
import { Box, Typography, Button, Pagination, CircularProgress } from '@mui/material';
import { MdAdd } from 'react-icons/md';
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
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Cargar ventas desde el backend con paginación
    useEffect(() => {
        const fetchVentas = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await http.get<PaginatedResponse>(
                    `/ventas/paginated?page=${currentPage}&size=${ITEMS_PER_PAGE}`
                );

                // Transformar los datos del backend al formato del frontend
                const ventasFormateadas: Sale[] = (response.data.content || []).map(venta => ({
                    id: String(venta.id),
                    date: venta.fechaHora,
                    paymentMethod: mapPaymentMethod(venta.metodoPago),
                    total: venta.total,
                    items: (venta.detalles || []).map(detalle => ({
                        productId: String(detalle.id),
                        productName: detalle.nombreProducto,
                        quantity: detalle.cantidad,
                        unitPrice: detalle.precioUnitario,
                        total: detalle.cantidad * detalle.precioUnitario // Calcular subtotal
                    }))
                }));

                setSales(ventasFormateadas);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            } catch (err: any) {
                setError('Error al cargar las ventas');
                setSales([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVentas();
    }, [currentPage, refreshTrigger]);

    // Calcular estadísticas del día (temporal - idealmente del backend)
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(sale => sale.date.startsWith(today));
    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayCount = todaySales.length;

    // Estadísticas totales (temporal - idealmente del backend)
    const totalSales = totalElements;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

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
                totalSales={totalSales}
                averageSale={averageSale}
            />

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
