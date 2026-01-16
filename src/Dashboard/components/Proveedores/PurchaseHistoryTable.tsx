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
import type { Purchase } from './ProveedoresContent';
import { useState } from 'react';

interface PurchaseHistoryTableProps {
    purchases: Purchase[];
}

const PurchaseHistoryTable = ({ purchases }: PurchaseHistoryTableProps) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (purchaseId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(purchaseId)) {
            newExpanded.delete(purchaseId);
        } else {
            newExpanded.add(purchaseId);
        }
        setExpandedRows(newExpanded);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return { bg: '#dcfce7', color: '#16a34a' };
            case 'pending':
                return { bg: '#fef3c7', color: '#d97706' };
            case 'cancelled':
                return { bg: '#fee2e2', color: '#dc2626' };
            default:
                return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completada';
            case 'pending':
                return 'Pendiente';
            case 'cancelled':
                return 'Cancelada';
            default:
                return status;
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

    if (purchases.length === 0) {
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
                    No hay compras registradas
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
                        <TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Estado</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Items</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Detalles</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {purchases.map((purchase) => {
                        const isExpanded = expandedRows.has(purchase.id);
                        const statusStyle = getStatusColor(purchase.status);

                        return (
                            <>
                                <TableRow
                                    key={purchase.id}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: '#f8fafc'
                                        },
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggleRow(purchase.id)}
                                >
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {purchase.id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {purchase.providerName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(purchase.date)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body1" fontWeight={700} sx={{ color: '#0f172a' }}>
                                            ${purchase.total.toLocaleString('es-AR')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={getStatusLabel(purchase.status)}
                                            size="small"
                                            sx={{
                                                bgcolor: statusStyle.bg,
                                                color: statusStyle.color,
                                                fontWeight: 600
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${purchase.items.length} ${purchase.items.length === 1 ? 'item' : 'items'}`}
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
                                                toggleRow(purchase.id);
                                            }}
                                        >
                                            {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>

                                {/* Expanded Row - Details */}
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
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
                                                        {purchase.items.map((item, index) => (
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

export default PurchaseHistoryTable;
