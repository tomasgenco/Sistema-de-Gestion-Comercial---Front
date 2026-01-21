import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Tooltip
} from '@mui/material';
import { MdEdit } from 'react-icons/md';

export interface Product {
    id: string;
    name: string;
    barcode: string;
    price: number; // Precio de venta
    precioCompra: number; // Precio de compra
    margen: number; // Margen de ganancia en porcentaje
    stock: number;
    status: 'available' | 'low' | 'out';
    tipoVenta: 'UNIDAD' | 'PESO';
}

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
}

const ProductTable = ({ products, onEdit }: ProductTableProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return { bg: '#dcfce7', color: '#166534' };
            case 'low':
                return { bg: '#fef3c7', color: '#92400e' };
            case 'out':
                return { bg: '#fee2e2', color: '#991b1b' };
            default:
                return { bg: '#f1f5f9', color: '#475569' };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'available':
                return 'Disponible';
            case 'low':
                return 'Stock Bajo';
            case 'out':
                return 'Sin Stock';
            default:
                return 'Desconocido';
        }
    };

    return (
        <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden', borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Producto</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>SKU</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Precio Compra</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Precio Venta</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Margen</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Stock</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Estado</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#64748b' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => {
                            const statusStyle = getStatusColor(product.status);
                            return (
                                <TableRow
                                    key={product.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                                        {product.name}
                                    </TableCell>
                                    <TableCell sx={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                        {product.barcode}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#dc2626' }}>
                                        ${(product.precioCompra || 0).toLocaleString('es-AR')}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#16a34a' }}>
                                        ${product.price.toLocaleString('es-AR')}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${(product.margen || 0).toFixed(1)}%`}
                                            size="small"
                                            sx={{
                                                bgcolor: (product.margen || 0) >= 30 ? '#dcfce7' : (product.margen || 0) >= 15 ? '#fef3c7' : '#fee2e2',
                                                color: (product.margen || 0) >= 30 ? '#16a34a' : (product.margen || 0) >= 15 ? '#d97706' : '#dc2626',
                                                fontWeight: 600,
                                                borderRadius: 2
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        {product.stock} {product.tipoVenta === 'PESO' ? 'kg' : 'unidades'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(product.status)}
                                            size="small"
                                            sx={{
                                                bgcolor: statusStyle.bg,
                                                color: statusStyle.color,
                                                fontWeight: 600,
                                                borderRadius: 2
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar producto">
                                            <IconButton
                                                size="small"
                                                onClick={() => onEdit(product)}
                                                sx={{
                                                    bgcolor: '#eff6ff',
                                                    color: '#1e40af',
                                                    '&:hover': {
                                                        bgcolor: '#dbeafe',
                                                    }
                                                }}
                                            >
                                                <MdEdit size={18} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default ProductTable;
