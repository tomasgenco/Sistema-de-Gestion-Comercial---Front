import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    Typography
} from '@mui/material';
import { MdAdd, MdRemove, MdDelete } from 'react-icons/md';
import type { SaleItem } from './VentasContent';

interface SaleDetailTableProps {
    items: SaleItem[];
    onQuantityChange: (productId: string, newQuantity: number) => void;
    onRemoveItem: (productId: string) => void;
}

const SaleDetailTable = ({ items, onQuantityChange, onRemoveItem }: SaleDetailTableProps) => {
    if (items.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                    bgcolor: '#f8fafc',
                    borderRadius: 3,
                    border: '2px dashed #cbd5e1'
                }}
            >
                <Typography variant="body1" color="text.secondary">
                    No hay productos agregados. Busque y agregue productos para iniciar la venta.
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
                border: '1px solid #e2e8f0',
                maxHeight: 400,
                overflow: 'auto'
            }}
        >
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Producto</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Cantidad</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Precio Unitario</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item) => (
                        <TableRow
                            key={item.productId}
                            sx={{
                                '&:hover': {
                                    bgcolor: '#f8fafc'
                                }
                            }}
                        >
                            <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                    {item.productName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ID: {item.productId}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
                                        sx={{
                                            bgcolor: '#fee2e2',
                                            color: '#dc2626',
                                            '&:hover': {
                                                bgcolor: '#fecaca'
                                            }
                                        }}
                                    >
                                        <MdRemove size={16} />
                                    </IconButton>
                                    <Typography
                                        variant="body1"
                                        fontWeight={600}
                                        sx={{
                                            minWidth: 40,
                                            textAlign: 'center',
                                            bgcolor: '#f8fafc',
                                            py: 0.5,
                                            px: 1.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        {item.quantity}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                                        sx={{
                                            bgcolor: '#dcfce7',
                                            color: '#16a34a',
                                            '&:hover': {
                                                bgcolor: '#bbf7d0'
                                            }
                                        }}
                                    >
                                        <MdAdd size={16} />
                                    </IconButton>
                                </Box>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" fontWeight={500}>
                                    ${item.unitPrice.toLocaleString('es-AR')}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="body1" fontWeight={700} sx={{ color: '#0f172a' }}>
                                    ${item.total.toLocaleString('es-AR')}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <IconButton
                                    size="small"
                                    onClick={() => onRemoveItem(item.productId)}
                                    sx={{
                                        color: '#dc2626',
                                        '&:hover': {
                                            bgcolor: '#fee2e2'
                                        }
                                    }}
                                >
                                    <MdDelete size={20} />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SaleDetailTable;
