import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, Divider, CircularProgress, IconButton } from '@mui/material';
import { MdAttachMoney, MdClose, MdCalendarToday } from 'react-icons/md';
import { http } from '../../../shared/api/http';
import FinanzasStats from './FinanzasStats';
import CierresCajaTable from './CierresCajaTable';

interface CierreCajaData {
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

interface CierreMesData {
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
    cierreCajas: Array<{
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
    }>;
}

// Función helper para formatear fecha sin problemas de zona horaria
const formatLocalDate = (dateString: string): string => {
    // Si la fecha viene en formato ISO (YYYY-MM-DD), la parseamos directamente
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);

        // Crear fecha en zona horaria local
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Fallback si el formato es diferente
    return new Date(dateString).toLocaleDateString('es-AR');
};

// Función helper para obtener nombre del mes
const getMonthName = (month: number): string => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
};

const FinanzasContent = () => {
    const [openCerrarCajaModal, setOpenCerrarCajaModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Estado para el modal de resultado
    const [openResultModal, setOpenResultModal] = useState(false);
    const [resultData, setResultData] = useState<CierreCajaData | null>(null);

    // Datos del cierre de caja
    const [cierreCajaData, setCierreCajaData] = useState<CierreCajaData | null>(null);

    // Inputs del usuario
    const [efectivoReal, setEfectivoReal] = useState('');
    const [observaciones, setObservaciones] = useState('');

    // Diferencia calculada
    const [diferencia, setDiferencia] = useState<number>(0);

    // Estados para cierre de mes
    const [openCerrarMesModal, setOpenCerrarMesModal] = useState(false);
    const [loadingMesData, setLoadingMesData] = useState(false);
    const [cierreMesData, setCierreMesData] = useState<CierreMesData | null>(null);
    const [openMesResultModal, setOpenMesResultModal] = useState(false);
    const [mesSuccessMessage, setMesSuccessMessage] = useState('');
    const [mesErrorMessage, setMesErrorMessage] = useState('');

    // Estados para estadísticas
    const [todayCount, setTodayCount] = useState(0);
    const [averageSale, setAverageSale] = useState(0);
    const [totalInventoryValue, setTotalInventoryValue] = useState(0);
    const [monthSales, setMonthSales] = useState(0);
    const [dayIncome, setDayIncome] = useState(0);
    const [dayExpenses, setDayExpenses] = useState(0);

    // Ref para el contenido del modal
    const dialogContentRef = useRef<HTMLDivElement>(null);

    const handleOpenCerrarCajaModal = async () => {
        setOpenCerrarCajaModal(true);
        setSuccessMessage('');
        setErrorMessage('');
        setEfectivoReal('');
        setObservaciones('');
        setDiferencia(0);

        // Obtener datos del cierre de caja
        setLoadingData(true);
        try {
            const response = await http.get('/cierre-caja/hoy');
            setCierreCajaData(response.data);
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Error al obtener los datos del cierre de caja.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleCloseCerrarCajaModal = () => {
        setOpenCerrarCajaModal(false);
        setSuccessMessage('');
        setErrorMessage('');
        setCierreCajaData(null);
        setEfectivoReal('');
        setObservaciones('');
        setDiferencia(0);
    };

    // Calcular diferencia cuando cambia el efectivo real
    useEffect(() => {
        if (cierreCajaData && efectivoReal) {
            const efectivoRealNum = parseFloat(efectivoReal);
            if (!isNaN(efectivoRealNum)) {
                const diff = efectivoRealNum - cierreCajaData.totalEfectivo;
                setDiferencia(diff);
            }
        } else {
            setDiferencia(0);
        }
    }, [efectivoReal, cierreCajaData]);

    // Cargar estadísticas desde el backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Cargar estadísticas de ventas
                const ventasResponse = await http.get<{
                    ventasDelMes: number;
                    ingresosTotalesDelDia: number;
                    egresosDelDia: number;
                    ventasDelDia: number;
                }>('/ventas/stats');

                setTodayCount(ventasResponse.data.ventasDelDia);
                setAverageSale(ventasResponse.data.ventasDelDia > 0 ? ventasResponse.data.ingresosTotalesDelDia / ventasResponse.data.ventasDelDia : 0);
                setMonthSales(ventasResponse.data.ventasDelMes);
                setDayIncome(ventasResponse.data.ingresosTotalesDelDia);
                setDayExpenses(ventasResponse.data.egresosDelDia);

                // Cargar estadísticas de inventario
                const stockResponse = await http.get<{
                    totalProductos: number;
                    productosStockBajo: number;
                    productosSinStock: number;
                    valorTotalInventario: number;
                }>('/producto/stats');

                setTotalInventoryValue(stockResponse.data.valorTotalInventario);
            } catch (err: any) {
                // Si falla, mantener valores en 0
                setTodayCount(0);
                setAverageSale(0);
                setTotalInventoryValue(0);
                setMonthSales(0);
                setDayIncome(0);
                setDayExpenses(0);
            }
        };

        fetchStats();
    }, []); // Solo cargar al montar el componente


    const handleCerrarCaja = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            // Validar que se haya ingresado el efectivo real
            if (!efectivoReal || efectivoReal.trim() === '') {
                setErrorMessage('Debe ingresar el efectivo real en caja.');
                setLoading(false);
                return;
            }

            const efectivoRealNum = parseFloat(efectivoReal);
            if (isNaN(efectivoRealNum) || efectivoRealNum < 0) {
                setErrorMessage('El efectivo real debe ser un número válido mayor o igual a 0.');
                setLoading(false);
                return;
            }

            // Enviar datos del cierre de caja
            await http.post('/cierre-caja', {
                efectivoReal: efectivoRealNum,
                diferencia: diferencia,
                observaciones: observaciones.trim() || null
            });

            // Guardar datos para el modal de resultado
            setResultData(cierreCajaData);
            setSuccessMessage('Caja cerrada exitosamente');

            // Cerrar el modal principal y abrir el modal de resultado
            setOpenCerrarCajaModal(false);
            setTimeout(() => {
                setOpenResultModal(true);
            }, 300);

        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Error al cerrar la caja. Por favor, intente nuevamente.');

            // Cerrar el modal principal y abrir el modal de resultado con el error
            setOpenCerrarCajaModal(false);
            setTimeout(() => {
                setOpenResultModal(true);
            }, 300);
        } finally {
            setLoading(false);
        }
    };

    // Funciones para cierre de mes
    const handleOpenCerrarMesModal = async () => {
        setOpenCerrarMesModal(true);
        setMesSuccessMessage('');
        setMesErrorMessage('');

        // Obtener datos del preview del cierre de mes
        setLoadingMesData(true);
        try {
            const currentDate = new Date();
            const mes = currentDate.getMonth() + 1;
            const anio = currentDate.getFullYear();

            const response = await http.get('/cierre-mes/preview', {
                params: { mes, anio }
            });
            setCierreMesData(response.data);
        } catch (error: any) {
            setMesErrorMessage(error.response?.data?.message || 'Error al obtener los datos del cierre de mes.');
        } finally {
            setLoadingMesData(false);
        }
    };

    const handleCloseCerrarMesModal = () => {
        setOpenCerrarMesModal(false);
        setMesSuccessMessage('');
        setMesErrorMessage('');
        setCierreMesData(null);
    };

    const handleCerrarMes = async () => {
        if (!cierreMesData) return;

        setLoading(true);
        setMesErrorMessage('');

        try {
            await http.post('/cierre-mes', {
                mes: cierreMesData.mes,
                anio: cierreMesData.anio
            });

            setMesSuccessMessage('Mes cerrado exitosamente');

            // Cerrar el modal principal y abrir el modal de resultado
            setOpenCerrarMesModal(false);
            setTimeout(() => {
                setOpenMesResultModal(true);
            }, 300);

        } catch (error: any) {
            // Construir mensaje de error personalizado
            let errorMsg = 'Error al cerrar el mes. Por favor, intente nuevamente.';

            // Verificar si hay datos de respuesta del servidor
            if (error.response?.data) {
                const responseData = error.response.data;

                // Si el error es específicamente CIERRE_MES_DUPLICADO (status 409 o code field)
                if (responseData.code === 'CIERRE_MES_DUPLICADO' || error.response.status === 409) {
                    console.log('Error de cierre duplicado detectado');
                    console.log('cierreMesData:', cierreMesData);
                    console.log('responseData:', responseData);
                    // Construir mensaje personalizado con el mes y año
                    if (cierreMesData) {
                        errorMsg = `Ya existe un cierre registrado para ${getMonthName(cierreMesData.mes)} ${cierreMesData.anio}`;
                        console.log('Mensaje construido con cierreMesData:', errorMsg);
                    }
                } else if (responseData.message) {
                    // Para cualquier otro error, usar el mensaje del servidor si existe
                    errorMsg = responseData.message;
                }
            }

            console.log('Mensaje de error que se va a mostrar:', errorMsg);
            setMesErrorMessage(errorMsg);

            // Cerrar el modal principal y abrir el modal de resultado con el error
            setOpenCerrarMesModal(false);
            setTimeout(() => {
                setOpenMesResultModal(true);
            }, 300);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#0f172a" gutterBottom>
                    Finanzas
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gestión financiera y control de caja
                </Typography>
            </Box>

            {/* Cards de Cierre */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                {/* Cerrar Caja Card */}
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: '#d1fae5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2
                                }}
                            >
                                <MdAttachMoney size={28} color="#059669" />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color="#0f172a">
                                    Cierre de Caja
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Registra el cierre diario de operaciones
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Al cerrar la caja se generará un reporte con todas las transacciones del día,
                            incluyendo ventas, métodos de pago y totales.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={handleOpenCerrarCajaModal}
                            sx={{
                                bgcolor: '#10b981',
                                color: 'white',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: '#059669'
                                }
                            }}
                        >
                            Cerrar Caja
                        </Button>
                    </CardContent>
                </Card>

                {/* Cerrar Mes Card */}
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2
                                }}
                            >
                                <MdCalendarToday size={28} color="#2563eb" />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color="#0f172a">
                                    Cierre de Mes
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Registra el cierre mensual de operaciones
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Al cerrar el mes se generará un resumen consolidado con todos los cierres de caja,
                            ingresos, egresos y resultado total del mes.
                        </Typography>

                        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="body2">
                                <strong>Recomendación:</strong> Hacer cierre de caja diario todos los días antes de cerrar el mes, así todo queda consistente.
                            </Typography>
                        </Alert>

                        <Button
                            variant="contained"
                            onClick={handleOpenCerrarMesModal}
                            sx={{
                                bgcolor: '#3b82f6',
                                color: 'white',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: '#2563eb'
                                }
                            }}
                        >
                            Cerrar Mes
                        </Button>
                    </CardContent>
                </Card>
            </Box>

            {/* Stats */}
            <FinanzasStats
                todayCount={todayCount}
                averageSale={averageSale}
                totalInventoryValue={totalInventoryValue}
                monthSales={monthSales}
                dayIncome={dayIncome}
                dayExpenses={dayExpenses}
            />

            {/* Main Content */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Tabla de Cierres de Caja */}
                <CierresCajaTable />
            </Box>

            {/* Modal de Cierre de Caja */}
            <Dialog
                open={openCerrarCajaModal}
                onClose={handleCloseCerrarCajaModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#0f172a', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Cierre de Caja
                    <IconButton
                        onClick={handleCloseCerrarCajaModal}
                        sx={{
                            color: '#64748b',
                            '&:hover': {
                                bgcolor: '#f1f5f9'
                            }
                        }}
                    >
                        <MdClose size={24} />
                    </IconButton>
                </DialogTitle>
                <DialogContent ref={dialogContentRef}>



                    {loadingData ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : cierreCajaData ? (
                        <Box sx={{ mt: 2 }}>
                            {/* Datos del Sistema */}
                            <Typography variant="h6" fontWeight="bold" color="#0f172a" gutterBottom>
                                Datos del Sistema
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Fecha
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        {formatLocalDate(cierreCajaData.fecha)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Ventas
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        ${cierreCajaData.totalVentas.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Efectivo (Sistema)
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600" color="#10b981">
                                        ${cierreCajaData.totalEfectivo.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Mercado Pago
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        ${cierreCajaData.totalMercadoPago.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Cuenta DNI
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        ${cierreCajaData.totalCuentaDni.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Tarjeta de Crédito
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        ${cierreCajaData.totalTarjetaCredito.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 100%', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Tarjeta de Débito
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        ${cierreCajaData.totalTarjetaDebito.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Inputs del Usuario */}
                            <Typography variant="h6" fontWeight="bold" color="#0f172a" gutterBottom>
                                Efectivo Real en Caja
                            </Typography>
                            <TextField
                                fullWidth
                                label="Efectivo Real"
                                type="number"
                                value={efectivoReal}
                                onChange={(e) => setEfectivoReal(e.target.value)}
                                placeholder="Ingrese el efectivo real en caja"
                                disabled={loading || !!successMessage}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                                }}
                            />

                            {/* Mostrar diferencia */}
                            {efectivoReal && !isNaN(parseFloat(efectivoReal)) && (
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: diferencia === 0 ? '#d1fae5' : '#fef3c7',
                                        borderRadius: 2,
                                        border: diferencia === 0 ? '2px solid #10b981' : '2px solid #f59e0b',
                                        mb: 2
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color={diferencia === 0 ? '#065f46' : '#92400e'}
                                        fontWeight="600"
                                    >
                                        Diferencia: ${Math.abs(diferencia).toFixed(2)} {diferencia > 0 ? '(Sobrante)' : diferencia < 0 ? '(Faltante)' : ''}
                                    </Typography>
                                    {diferencia !== 0 && (
                                        <Typography
                                            variant="body2"
                                            color="#92400e"
                                            sx={{ mt: 1 }}
                                        >
                                            ⚠️ Cierre con diferencia. El efectivo real no coincide con el total esperado por el sistema. Se deja constancia para control administrativo.
                                        </Typography>
                                    )}
                                    {diferencia === 0 && (
                                        <Typography
                                            variant="body2"
                                            color="#065f46"
                                            sx={{ mt: 1 }}
                                        >
                                            ✓ El efectivo real coincide con el total del sistema.
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* Campo de observaciones */}
                            <TextField
                                fullWidth
                                label="Observaciones (opcional)"
                                multiline
                                rows={3}
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Agregue observaciones sobre el cierre de caja"
                                disabled={loading || !!successMessage}
                            />
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseCerrarCajaModal}
                        variant="outlined"
                        disabled={loading}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': {
                                borderColor: '#cbd5e1',
                                bgcolor: '#f8fafc'
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCerrarCaja}
                        variant="contained"
                        disabled={loading || !!successMessage || !efectivoReal || loadingData}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#10b981',
                            '&:hover': {
                                bgcolor: '#059669'
                            },
                            '&:disabled': {
                                bgcolor: '#cbd5e1'
                            }
                        }}
                    >
                        {loading ? 'Cerrando...' : 'Confirmar Cierre'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Resultado del Cierre */}
            <Dialog open={openResultModal} onClose={() => { setOpenResultModal(false); setSuccessMessage(''); setErrorMessage(''); setResultData(null); setEfectivoReal(''); setObservaciones(''); setDiferencia(0); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#0f172a', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Cierre de Caja Confirmado
                    <IconButton onClick={() => { setOpenResultModal(false); setSuccessMessage(''); setErrorMessage(''); setResultData(null); setEfectivoReal(''); setObservaciones(''); setDiferencia(0); }} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
                        <MdClose size={24} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                            <Typography variant="body1" fontWeight="bold">✓ Caja cerrada exitosamente</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>El cierre de caja se ha registrado correctamente.</Typography>
                        </Alert>
                    )}
                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            <Typography variant="body1" fontWeight="bold">✗ Error al cerrar la caja</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>{errorMessage}</Typography>
                        </Alert>
                    )}
                    {resultData && (
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="700" gutterBottom>Resumen del cierre:</Typography>
                            <Typography variant="body2">• Fecha: {formatLocalDate(resultData.fecha)}</Typography>
                            <Typography variant="body2">• Total ventas: ${resultData.totalVentas.toFixed(2)}</Typography>
                            <Typography variant="body2">• Efectivo esperado: ${resultData.totalEfectivo.toFixed(2)}</Typography>
                            <Typography variant="body2">• Efectivo real: ${parseFloat(efectivoReal).toFixed(2)}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: diferencia === 0 ? '#065f46' : '#92400e', mt: 1 }}>• Diferencia: ${Math.abs(diferencia).toFixed(2)} {diferencia > 0 ? '(Sobrante)' : diferencia < 0 ? '(Faltante)' : '(Sin diferencia)'}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => { setOpenResultModal(false); setSuccessMessage(''); setErrorMessage(''); setResultData(null); setEfectivoReal(''); setObservaciones(''); setDiferencia(0); }} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Cierre de Mes */}
            <Dialog
                open={openCerrarMesModal}
                onClose={handleCloseCerrarMesModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#0f172a', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Cierre de Mes
                    <IconButton
                        onClick={handleCloseCerrarMesModal}
                        sx={{
                            color: '#64748b',
                            '&:hover': {
                                bgcolor: '#f1f5f9'
                            }
                        }}
                    >
                        <MdClose size={24} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {loadingMesData ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : mesErrorMessage ? (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                            {mesErrorMessage}
                        </Alert>
                    ) : cierreMesData ? (
                        <Box sx={{ mt: 2 }}>
                            {/* Datos del Mes */}
                            <Typography variant="h6" fontWeight="bold" color="#0f172a" gutterBottom>
                                Resumen de {getMonthName(cierreMesData.mes)} {cierreMesData.anio}
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Efectivo
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600" color="#10b981">
                                        ${cierreMesData.totalEfectivo.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Mercado Pago
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        ${cierreMesData.totalMercadoPago.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Cuenta DNI
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        ${cierreMesData.totalCuentaDni.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '200px', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Tarjeta de Crédito
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        ${cierreMesData.totalTarjetaCredito.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 100%', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Tarjeta de Débito
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        ${cierreMesData.totalTarjetaDebito.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Ingresos, Egresos y Resultado */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                                <Box sx={{ flex: '1 1 calc(33.33% - 8px)', minWidth: '150px', p: 2, bgcolor: '#d1fae5', borderRadius: 2 }}>
                                    <Typography variant="body2" color="#065f46">
                                        Ingresos Totales
                                    </Typography>
                                    <Typography variant="h6" fontWeight="700" color="#065f46">
                                        ${cierreMesData.ingresosTotal.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(33.33% - 8px)', minWidth: '150px', p: 2, bgcolor: '#fee2e2', borderRadius: 2 }}>
                                    <Typography variant="body2" color="#991b1b">
                                        Egresos Totales
                                    </Typography>
                                    <Typography variant="h6" fontWeight="700" color="#991b1b">
                                        ${cierreMesData.egresosTotal.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: '1 1 calc(33.33% - 8px)', minWidth: '150px', p: 2, bgcolor: cierreMesData.resultadoTotal >= 0 ? '#dbeafe' : '#fef3c7', borderRadius: 2 }}>
                                    <Typography variant="body2" color={cierreMesData.resultadoTotal >= 0 ? '#1e40af' : '#92400e'}>
                                        Resultado Total
                                    </Typography>
                                    <Typography variant="h6" fontWeight="700" color={cierreMesData.resultadoTotal >= 0 ? '#1e40af' : '#92400e'}>
                                        ${cierreMesData.resultadoTotal.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Total de cierres de caja en el mes: {cierreMesData.cierreCajas.length}
                            </Typography>
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseCerrarMesModal}
                        variant="outlined"
                        disabled={loading}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': {
                                borderColor: '#cbd5e1',
                                bgcolor: '#f8fafc'
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCerrarMes}
                        variant="contained"
                        disabled={loading || !cierreMesData || loadingMesData}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#3b82f6',
                            '&:hover': {
                                bgcolor: '#2563eb'
                            },
                            '&:disabled': {
                                bgcolor: '#cbd5e1'
                            }
                        }}
                    >
                        {loading ? 'Cerrando...' : 'Confirmar Cierre'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Resultado del Cierre de Mes */}
            <Dialog
                open={openMesResultModal}
                onClose={() => {
                    setOpenMesResultModal(false);
                    setMesSuccessMessage('');
                    setMesErrorMessage('');
                    setCierreMesData(null);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#0f172a', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Cierre de Mes Confirmado
                    <IconButton
                        onClick={() => {
                            setOpenMesResultModal(false);
                            setMesSuccessMessage('');
                            setMesErrorMessage('');
                            setCierreMesData(null);
                        }}
                        sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                    >
                        <MdClose size={24} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {mesSuccessMessage && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                            <Typography variant="body1" fontWeight="bold">✓ Mes cerrado exitosamente</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>El cierre de mes se ha registrado correctamente.</Typography>
                        </Alert>
                    )}
                    {mesErrorMessage && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            <Typography variant="body1" fontWeight="bold">✗ Error al cerrar el mes</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>{mesErrorMessage}</Typography>
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => {
                            setOpenMesResultModal(false);
                            setMesSuccessMessage('');
                            setMesErrorMessage('');
                            setCierreMesData(null);
                        }}
                        variant="contained"
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FinanzasContent;
