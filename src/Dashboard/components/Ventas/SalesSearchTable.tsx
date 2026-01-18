import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Box,
    Collapse,
    IconButton
} from '@mui/material';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import type { Sale } from './VentasContent';
import { useState } from 'react';

interface SalesSearchTableProps {
    sales: Sale[];
}

const SalesSearchTable = ({ sales }: SalesSearchTableProps) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (saleId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(saleId)) {
            newExpanded.delete(saleId);
        } else {
            newExpanded.add(saleId);
        }
        setExpandedRows(newExpanded);
    };

    // Función para normalizar el método de pago del backend
    const normalizePaymentMethod = (method: string): string => {
        return method.toLowerCase().replace(/[_\s]+/g, '');
    };

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!sales || sales.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 300,
                    bgcolor: '#f8fafc',
                    borderRadius: 3,
                    border: '2px dashed #cbd5e1'
                }}
            >
                <Typography variant="body1" color="text.secondary">
                    No se encontraron ventas
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid #e2e8f0'
            }}
        >
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Método de Pago</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Items</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Detalles</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sales.map((sale) => {
                        const isExpanded = expandedRows.has(sale.id);
                        const paymentColors = getPaymentMethodColor(sale.paymentMethod);

                        return (
                            <>
                                <TableRow
                                    key={sale.id}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: '#f8fafc'
                                        },
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggleRow(sale.id)}
                                >
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {sale.id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(sale.date)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getPaymentMethodLabel(sale.paymentMethod)}
                                            size="small"
                                            sx={{
                                                bgcolor: paymentColors.bg,
                                                color: paymentColors.color,
                                                fontWeight: 600,
                                                textTransform: 'capitalize'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body1" fontWeight={700} sx={{ color: '#0f172a' }}>
                                            ${sale.total.toLocaleString('es-AR')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${sale.items.length} ${sale.items.length === 1 ? 'item' : 'items'}`}
                                            size="small"
                                            sx={{
                                                bgcolor: '#ede9fe',
                                                color: '#7c3aed',
                                                fontWeight: 600
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRow(sale.id);
                                            }}
                                        >
                                            {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>

                                {/* Expanded Row - Details */}
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        sx={{
                                            py: 0,
                                            borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none'
                                        }}
                                    >
                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                            <Box sx={{ p: 3, bgcolor: '#fafbfc' }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#0f172a' }}>
                                                    Detalle de Productos
                                                </Typography>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Cantidad</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Precio Unit.</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {sale.items.map((item, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight={500}>
                                                                        {item.productName}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        ID: {item.productId}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Chip
                                                                        label={item.quantity}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: '#f1f5f9',
                                                                            fontWeight: 600,
                                                                            minWidth: 40
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    ${item.unitPrice.toLocaleString('es-AR')}
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        ${item.total.toLocaleString('es-AR')}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SalesSearchTable;
