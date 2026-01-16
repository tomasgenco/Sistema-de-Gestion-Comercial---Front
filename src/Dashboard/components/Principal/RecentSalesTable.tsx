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
                console.error('Error al cargar ventas:', err);
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
                console.error('Fecha inválida:', fechaHora);
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
            console.error('Error al formatear fecha:', error, fechaHora);
            return '--/--/-- --:--';
        }
    };


    // Función para obtener el color del chip según el método de pago
    const getPaymentMethodColor = (method: string) => {
        const methodLower = method.toLowerCase();
        if (methodLower.includes('efectivo')) {
            return { bgcolor: '#dcfce7', color: '#166534' };
        } else if (methodLower.includes('mercado pago') || methodLower.includes('mercadopago')) {
            return { bgcolor: '#e0f2fe', color: '#0369a1' };
        } else if (methodLower.includes('tarjeta') || methodLower.includes('débito') || methodLower.includes('crédito')) {
            return { bgcolor: '#fef3c7', color: '#92400e' };
        } else if (methodLower.includes('transferencia')) {
            return { bgcolor: '#e9d5ff', color: '#6b21a8' };
        }
        return { bgcolor: '#f1f5f9', color: '#475569' };
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
                                                label={venta.metodoPago}
                                                size="small"
                                                sx={{
                                                    ...paymentColors,
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
