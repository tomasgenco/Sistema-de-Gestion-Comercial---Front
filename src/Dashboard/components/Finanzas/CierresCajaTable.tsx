import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    Pagination,
    CircularProgress,
    Chip,
    IconButton,
    Collapse
} from '@mui/material';
import { MdExpandMore, MdExpandLess, MdRefresh } from 'react-icons/md';
import { http } from '../../../shared/api/http';

interface CierreCajaDiario {
    id: number;
    fecha: string;
    totalEfectivo: number;
    totalMercadoPago: number;
    totalCuentaDni: number;
    totalTarjetaCredito: number;
    totalTarjetaDebito: number;
    totalVentas: number;
    efectivoReal: number;
    diferencia: number;
    observaciones: string | null;
}

interface PaginatedResponse {
    content: CierreCajaDiario[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

interface CierreMensual {
    id: number;
    mes: number;
    anio: number;
    totalEfectivo: number;
    totalMercadoPago: number;
    totalCuentaDni: number;
    totalTarjetaCredito: number;
    totalTarjetaDebito: number;
    ingresosTotal: number;
    egresosTotal: number;
    resultadoTotal: number;
    cierreCajas: null; // Optimizado, no incluye detalles
}

interface PaginatedMensualResponse {
    content: CierreMensual[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

// Función helper para formatear fecha
const formatLocalDate = (dateString: string): string => {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    return new Date(dateString).toLocaleDateString('es-AR');
};

// Función helper para obtener nombre del mes
const getMonthName = (month: number): string => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
};

const CierresCajaTable = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);

    // Estados para cierres diarios
    const [cierresDiarios, setCierresDiarios] = useState<CierreCajaDiario[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    // Estados para cierres mensuales
    const [cierresMensuales, setCierresMensuales] = useState<CierreMensual[]>([]);
    const [currentPageMensual, setCurrentPageMensual] = useState(1);
    const [totalPagesMensual, setTotalPagesMensual] = useState(1);
    const [totalElementsMensual, setTotalElementsMensual] = useState(0);



    // Fetch cierres diarios
    const fetchCierresDiarios = async (page: number = 1) => {
        setLoading(true);
        try {
            const currentDate = new Date();
            const mes = currentDate.getMonth() + 1; // 1-12
            const anio = currentDate.getFullYear();

            const params: any = {
                page: page, // Backend usa 1-indexed
                size: 10,
                mes: mes,
                año: anio
            };

            const response = await http.get<PaginatedResponse>('/cierre-caja', { params });
            setCierresDiarios(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error al cargar cierres de caja:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch cierres mensuales
    const fetchCierresMensuales = async (page: number = 1) => {
        setLoading(true);
        try {
            const params: any = {
                page: page, // Backend usa 0-indexed para cierres mensuales
                size: 12
            };

            const response = await http.get<PaginatedMensualResponse>('/cierre-mes/lista', { params });
            setCierresMensuales(response.data.content);
            setTotalPagesMensual(response.data.totalPages);
            setTotalElementsMensual(response.data.totalElements);
            setCurrentPageMensual(page);
        } catch (error) {
            console.error('Error al cargar cierres mensuales:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 0) {
            fetchCierresDiarios(1);
        } else if (activeTab === 1) {
            fetchCierresMensuales(1);
        }
    }, [activeTab]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setCurrentPage(1);
        setCurrentPageMensual(1);
        setExpandedRow(null);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        fetchCierresDiarios(page);
        setExpandedRow(null);
    };

    const handlePageChangeMensual = (_event: React.ChangeEvent<unknown>, page: number) => {
        fetchCierresMensuales(page);
    };

    const toggleRowExpansion = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'visible' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 2 }}>
                    📊 Historial de Cierres
                </Typography>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ minHeight: 40 }}>
                    <Tab label="Cierres Diarios del mes" sx={{ textTransform: 'none', fontWeight: 600 }} />
                    <Tab label="Cierres mensuales" sx={{ textTransform: 'none', fontWeight: 600 }} />
                </Tabs>
            </Box>

            {/* Tab Panel: Cierres Diarios */}
            {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                    {/* Botón de refrescar */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <IconButton
                            onClick={() => fetchCierresDiarios(currentPage)}
                            sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                        >
                            <MdRefresh size={24} />
                        </IconButton>
                    </Box>

                    {/* Contador de resultados */}
                    <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
                        Mostrando {cierresDiarios.length} cierres
                    </Typography>

                    {/* Tabla */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : cierresDiarios.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="body1" color="text.secondary">
                                No se encontraron cierres de caja
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Fecha</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Total Ventas</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Efectivo Esperado</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Efectivo Real</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, color: '#0f172a' }}>Diferencia</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, color: '#0f172a' }}>Detalles</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cierresDiarios.map((cierre) => (
                                            <>
                                                <TableRow
                                                    key={cierre.id}
                                                    sx={{
                                                        '&:hover': { bgcolor: '#f8fafc' },
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => toggleRowExpansion(cierre.id)}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {formatLocalDate(cierre.fecha)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" fontWeight={600} color="#0f172a">
                                                            ${cierre.totalVentas.toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2">
                                                            ${cierre.totalEfectivo.toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2">
                                                            ${cierre.efectivoReal.toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={`${cierre.diferencia >= 0 ? '+' : ''}$${cierre.diferencia.toFixed(2)}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: cierre.diferencia === 0 ? '#d1fae5' : cierre.diferencia > 0 ? '#dbeafe' : '#fee2e2',
                                                                color: cierre.diferencia === 0 ? '#065f46' : cierre.diferencia > 0 ? '#1e40af' : '#991b1b',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton size="small">
                                                            {expandedRow === cierre.id ? <MdExpandLess /> : <MdExpandMore />}
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedRow === cierre.id ? undefined : 'none' }}>
                                                        <Collapse in={expandedRow === cierre.id} timeout="auto" unmountOnExit>
                                                            <Box sx={{ py: 3, px: 2, bgcolor: '#f8fafc' }}>
                                                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                                                    Desglose de Métodos de Pago
                                                                </Typography>
                                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary">Efectivo</Typography>
                                                                        <Typography variant="body2" fontWeight={600}>${cierre.totalEfectivo.toFixed(2)}</Typography>
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary">Mercado Pago</Typography>
                                                                        <Typography variant="body2" fontWeight={600}>${cierre.totalMercadoPago.toFixed(2)}</Typography>
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary">Cuenta DNI</Typography>
                                                                        <Typography variant="body2" fontWeight={600}>${cierre.totalCuentaDni.toFixed(2)}</Typography>
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary">Tarjeta Crédito</Typography>
                                                                        <Typography variant="body2" fontWeight={600}>${cierre.totalTarjetaCredito.toFixed(2)}</Typography>
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary">Tarjeta Débito</Typography>
                                                                        <Typography variant="body2" fontWeight={600}>${cierre.totalTarjetaDebito.toFixed(2)}</Typography>
                                                                    </Box>
                                                                </Box>
                                                                {cierre.observaciones && (
                                                                    <Box sx={{ mt: 2, p: 2, bgcolor: '#fff', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                                                                        <Typography variant="caption" color="text.secondary">Observaciones</Typography>
                                                                        <Typography variant="body2" sx={{ mt: 0.5 }}>{cierre.observaciones}</Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        shape="rounded"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            )}

            {/* Tab Panel: Cierres Mensuales */}
            {activeTab === 1 && (
                <Box sx={{ p: 3 }}>
                    {/* Botón de refrescar */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Mostrando {cierresMensuales.length} de {totalElementsMensual} cierres mensuales
                        </Typography>
                        <IconButton
                            onClick={() => fetchCierresMensuales(currentPageMensual)}
                            sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                        >
                            <MdRefresh size={24} />
                        </IconButton>
                    </Box>

                    {/* Tabla */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : cierresMensuales.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="body1" color="text.secondary">
                                No se encontraron cierres mensuales
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Período</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Efectivo</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Mercado Pago</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Cuenta DNI</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>T. Crédito</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>T. Débito</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Ingresos</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>Egresos</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, color: '#0f172a' }}>Resultado</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cierresMensuales.map((cierre) => (
                                            <TableRow
                                                key={cierre.id}
                                                sx={{
                                                    '&:hover': { bgcolor: '#f8fafc' }
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {getMonthName(cierre.mes)} {cierre.anio}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        ${cierre.totalEfectivo.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        ${cierre.totalMercadoPago.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        ${cierre.totalCuentaDni.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        ${cierre.totalTarjetaCredito.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        ${cierre.totalTarjetaDebito.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600} color="#065f46">
                                                        ${cierre.ingresosTotal.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600} color="#991b1b">
                                                        ${cierre.egresosTotal.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={`${cierre.resultadoTotal >= 0 ? '+' : ''}$${cierre.resultadoTotal.toFixed(2)}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: cierre.resultadoTotal >= 0 ? '#dbeafe' : '#fee2e2',
                                                            color: cierre.resultadoTotal >= 0 ? '#1e40af' : '#991b1b',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Paginación */}
                            {totalPagesMensual > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Pagination
                                        count={totalPagesMensual}
                                        page={currentPageMensual}
                                        onChange={handlePageChangeMensual}
                                        color="primary"
                                        shape="rounded"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            )}
        </Card>
    );
};

export default CierresCajaTable;
