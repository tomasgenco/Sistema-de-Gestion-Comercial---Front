import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { http } from '../../../shared/api/http';

// Tipo para las ventas
interface Venta {
    id: number;
    fechaHora: string;
    total: number;
    metodoPago: string;
}

const RecentSalesTable = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await http.get('/ventas/ultimas');
                setVentas(response.data || []);
            } catch (err) {
                setError('Error al cargar las ventas');
                setVentas([]);
            } finally {
                setLoading(false);
            }
        };


        fetchVentas();
    }, []);

    // Función para formatear fecha y hora desde ISO 8601
    const formatDateTime = (fechaHora: string) => {
        try {
            // El servidor retorna: "2026-01-09T15:36:13.994608Z"
            const date = new Date(fechaHora);

            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) {
                return '--/--/-- --:--';
            }

            // Formatear fecha y hora local argentina
            const fechaFormateada = date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });

            const horaFormateada = date.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            return `${fechaFormateada} ${horaFormateada}`;
        } catch (error) {
            return '--/--/-- --:--';
        }
    };


    // Función para normalizar el método de pago del backend
    const normalizePaymentMethod = (method: string): string => {
        return method.toLowerCase().replace(/[_\s]+/g, '');
    };

    // Función para normalizar el nombre del método de pago
    const getPaymentMethodLabel = (method: string) => {
        const normalized = normalizePaymentMethod(method);
        switch (normalized) {
            case 'efectivo':
                return 'Efectivo';
            case 'mercadopago':
                return 'Mercado Pago';
            case 'cuentadni':
                return 'Cuenta DNI';
            case 'tarjetacredito':
                return 'Tarjeta Crédito';
            case 'tarjetadebito':
                return 'Tarjeta Débito';
            default:
                return method;
        }
    };

    // Función para obtener el color del chip según el método de pago
    const getPaymentMethodColor = (method: string) => {
        const normalized = normalizePaymentMethod(method);
        switch (normalized) {
            case 'efectivo':
                return { bg: '#dcfce7', color: '#16a34a' };
            case 'mercadopago':
                return { bg: '#dbeafe', color: '#2563eb' };
            case 'cuentadni':
                return { bg: '#fef3c7', color: '#d97706' };
            case 'tarjetacredito':
                return { bg: '#fce7f3', color: '#db2777' };
            case 'tarjetadebito':
                return { bg: '#e0e7ff', color: '#6366f1' };
            default:
                return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    return (
        <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden', borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Fecha y Hora</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>ID Venta</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Método de Pago</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography color="error">{error}</Typography>
                                </TableCell>
                            </TableRow>
                        ) : ventas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No hay ventas recientes</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            ventas.map((venta) => {
                                const paymentColors = getPaymentMethodColor(venta.metodoPago);
                                return (
                                    <TableRow
                                        key={venta.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                            {formatDateTime(venta.fechaHora)}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748b' }}>V-{venta.id.toString().padStart(4, '0')}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>${venta.total.toLocaleString('es-AR')}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getPaymentMethodLabel(venta.metodoPago)}
                                                size="small"
                                                sx={{
                                                    bgcolor: paymentColors.bg,
                                                    color: paymentColors.color,
                                                    fontWeight: 600,
                                                    borderRadius: 2
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default RecentSalesTable;
