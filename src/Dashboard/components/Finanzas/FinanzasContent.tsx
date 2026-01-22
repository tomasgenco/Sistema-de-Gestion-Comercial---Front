import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, Divider, CircularProgress } from '@mui/material';
import { MdAttachMoney } from 'react-icons/md';
import { http } from '../../../shared/api/http';
import FinanzasStats from './FinanzasStats';

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

const FinanzasContent = () => {
    const [openCerrarCajaModal, setOpenCerrarCajaModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Datos del cierre de caja
    const [cierreCajaData, setCierreCajaData] = useState<CierreCajaData | null>(null);

    // Inputs del usuario
    const [efectivoReal, setEfectivoReal] = useState('');
    const [observaciones, setObservaciones] = useState('');

    // Diferencia calculada
    const [diferencia, setDiferencia] = useState<number>(0);

    // Estados para estadísticas
    const [todayCount, setTodayCount] = useState(0);
    const [averageSale, setAverageSale] = useState(0);
    const [totalInventoryValue, setTotalInventoryValue] = useState(0);
    const [monthSales, setMonthSales] = useState(0);
    const [dayIncome, setDayIncome] = useState(0);
    const [dayExpenses, setDayExpenses] = useState(0);

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

            setSuccessMessage('Caja cerrada exitosamente');

            // Cerrar el modal después de 4 segundos para dar tiempo a leer el resumen
            setTimeout(() => {
                handleCloseCerrarCajaModal();
            }, 4000);

        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Error al cerrar la caja. Por favor, intente nuevamente.');
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
                                    bgcolor: '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2
                                }}
                            >
                                <MdAttachMoney size={28} color="white" />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color="#0f172a">
                                    Cerrar Caja
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Finalizar el día y generar reporte de caja
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

                {/* Placeholder para futuras funcionalidades */}
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        bgcolor: '#f8fafc'
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" fontWeight="bold" color="#64748b" gutterBottom>
                            Próximamente
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Aquí se agregarán más funcionalidades financieras como reportes,
                            estadísticas de ingresos y egresos, y gestión de gastos.
                        </Typography>
                    </CardContent>
                </Card>
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
                <DialogTitle sx={{ fontWeight: 'bold', color: '#0f172a', pb: 1 }}>
                    Cierre de Caja
                </DialogTitle>
                <DialogContent>
                    {successMessage && (
                        <Alert
                            severity="success"
                            sx={{
                                mb: 2,
                                borderRadius: 2,
                                '& .MuiAlert-message': {
                                    width: '100%'
                                }
                            }}
                        >
                            <Box>
                                <Typography variant="body1" fontWeight="bold" gutterBottom>
                                    ✓ Caja cerrada exitosamente
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    El cierre de caja se ha registrado correctamente en el sistema.
                                </Typography>
                                {cierreCajaData && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.5)', borderRadius: 1 }}>
                                        <Typography variant="caption" display="block" fontWeight="600">
                                            Resumen del cierre:
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • Fecha: {formatLocalDate(cierreCajaData.fecha)}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • Total ventas: ${cierreCajaData.totalVentas.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • Efectivo esperado: ${cierreCajaData.totalEfectivo.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • Efectivo real: ${parseFloat(efectivoReal).toFixed(2)}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            display="block"
                                            sx={{
                                                fontWeight: 600,
                                                color: diferencia === 0 ? '#065f46' : '#92400e'
                                            }}
                                        >
                                            • Diferencia: ${Math.abs(diferencia).toFixed(2)} {diferencia > 0 ? '(Sobrante)' : diferencia < 0 ? '(Faltante)' : '(Sin diferencia)'}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Alert>
                    )}
                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}

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
        </Box>
    );
};

export default FinanzasContent;
