import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';

// Mock Data for Table
const recentSales = [
    { id: 'V-0024', time: '10:45 AM', total: '$14,500', method: 'Efectivo' },
    { id: 'V-0023', time: '10:12 AM', total: '$8,200', method: 'Mercado Pago' },
    { id: 'V-0022', time: '09:50 AM', total: '$22,100', method: 'Tarjeta Débito' },
    { id: 'V-0021', time: '09:15 AM', total: '$5,400', method: 'Efectivo' },
    { id: 'V-0020', time: '08:40 AM', total: '$12,000', method: 'Transferencia' },
];

const RecentSalesTable = () => {
    return (
        <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden', borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Hora</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>ID Venta</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Método de Pago</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#64748b' }}>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentSales.map((row) => (
                            <TableRow
                                key={row.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                    {row.time}
                                </TableCell>
                                <TableCell sx={{ color: '#64748b' }}>{row.id}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{row.total}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.method}
                                        size="small"
                                        sx={{
                                            bgcolor: row.method === 'Efectivo' ? '#dcfce7' : '#e0f2fe',
                                            color: row.method === 'Efectivo' ? '#166534' : '#0369a1',
                                            fontWeight: 600,
                                            borderRadius: 2
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Chip label="Completado" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, borderRadius: 2 }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default RecentSalesTable;
