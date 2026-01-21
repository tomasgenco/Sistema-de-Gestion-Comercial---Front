import { useState, useEffect } from 'react';
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
    Typography,
    TextField
} from '@mui/material';
import { MdAdd, MdRemove, MdDelete } from 'react-icons/md';
import type { SaleItem } from './VentasContent';

interface SaleDetailTableProps {
    items: SaleItem[];
    onQuantityChange: (productId: string, newQuantity: number) => void;
    onRemoveItem: (productId: string) => void;
}

// Componente para manejar el input de cantidad con estado local
interface QuantityInputProps {
    item: SaleItem;
    onQuantityChange: (productId: string, newQuantity: number) => void;
}

const QuantityInput = ({ item, onQuantityChange }: QuantityInputProps) => {
    const [inputValue, setInputValue] = useState<string>(item.quantity === 0 ? '' : String(item.quantity));

    // Sincronizar con cambios externos (ej: botones +/-)
    useEffect(() => {
        setInputValue(item.quantity === 0 ? '' : String(item.quantity));
    }, [item.quantity]);

    const handleChange = (value: string) => {
        // Permitir campo vacío
        if (value === '') {
            setInputValue('');
            onQuantityChange(item.productId, 0);
            return;
        }

        // Permitir decimales si es por peso, solo enteros si es por unidad
        const regex = item.tipoVenta === 'PESO' ? /^\d*\.?\d*$/ : /^\d*$/;

        if (regex.test(value)) {
            setInputValue(value);
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                onQuantityChange(item.productId, numValue);
            }
        }
    };

    const handleBlur = () => {
        // Si el campo está vacío o es 0 al perder el foco, establecer en 1
        if (inputValue === '' || parseFloat(inputValue) === 0) {
            setInputValue('1');
            onQuantityChange(item.productId, 1);
        }
    };

    // Verificar si excede el stock
    const exceedsStock = item.maxStock !== undefined && item.quantity > item.maxStock;

    return (
        <TextField
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            size="small"
            error={exceedsStock}
            sx={{
                width: 80,
                '& input': {
                    textAlign: 'center',
                    fontWeight: 600,
                    padding: '6px 8px'
                },
                '& .MuiOutlinedInput-root': {
                    bgcolor: exceedsStock ? '#fee2e2' : '#f8fafc',
                    borderRadius: 2
                }
            }}
            inputProps={{
                style: { textAlign: 'center' }
            }}
        />
    );
};

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
                                    {item.tipoVenta === 'PESO' && ' • Por Peso (kg)'}
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
                                    <QuantityInput item={item} onQuantityChange={onQuantityChange} />
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
                                    {item.tipoVenta === 'PESO' && <Typography component="span" variant="caption" color="text.secondary"> /kg</Typography>}
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
