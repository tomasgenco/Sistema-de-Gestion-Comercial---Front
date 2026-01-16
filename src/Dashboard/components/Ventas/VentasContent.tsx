import { useState, useMemo } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { MdAdd, MdSearch } from 'react-icons/md';
import SaleModal from '../Ventas/SaleModal';
import SalesSearchTable from '../Ventas/SalesSearchTable';
import VentasStats from '../Ventas/VentasStats';

export interface Sale {
    id: string;
    date: string;
    paymentMethod: 'efectivo' | 'mercadopago' | 'cuentadni' | 'tarjetacredito' | 'tarjetadebito';
    total: number;
    items: SaleItem[];
}

export interface SaleItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// Datos de ejemplo (mock data)
const initialSales: Sale[] = [
    {
        id: 'V-001',
        date: '2026-01-15T10:30:00',
        paymentMethod: 'efectivo',
        total: 1335000,
        items: [
            { productId: 'P-001', productName: 'Laptop Dell XPS 15', quantity: 1, unitPrice: 1250000, total: 1250000 },
            { productId: 'P-002', productName: 'Mouse Logitech MX Master', quantity: 1, unitPrice: 85000, total: 85000 }
        ]
    },
    {
        id: 'V-002',
        date: '2026-01-15T11:45:00',
        paymentMethod: 'tarjetacredito',
        total: 240000,
        items: [
            { productId: 'P-003', productName: 'Teclado Mecánico RGB', quantity: 2, unitPrice: 120000, total: 240000 }
        ]
    },
    {
        id: 'V-003',
        date: '2026-01-15T13:20:00',
        paymentMethod: 'mercadopago',
        total: 650000,
        items: [
            { productId: 'P-010', productName: 'Placa de Video RTX 3060', quantity: 1, unitPrice: 650000, total: 650000 }
        ]
    },
    {
        id: 'V-004',
        date: '2026-01-14T09:15:00',
        paymentMethod: 'efectivo',
        total: 470000,
        items: [
            { productId: 'P-005', productName: 'Webcam Logitech C920', quantity: 2, unitPrice: 95000, total: 190000 },
            { productId: 'P-006', productName: 'Auriculares Sony WH-1000XM4', quantity: 1, unitPrice: 280000, total: 280000 }
        ]
    },
    {
        id: 'V-005',
        date: '2026-01-14T14:30:00',
        paymentMethod: 'tarjetadebito',
        total: 450000,
        items: [
            { productId: 'P-009', productName: 'Procesador Intel i7', quantity: 1, unitPrice: 450000, total: 450000 }
        ]
    }
];

const VentasContent = () => {
    const [sales, setSales] = useState<Sale[]>(initialSales);
    const [saleModalOpen, setSaleModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState<'all' | 'date' | 'id' | 'paymentMethod'>('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

    // Filtrar ventas
    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const searchLower = searchTerm.toLowerCase();

            // Filtro por tipo de búsqueda
            let matchesSearch = true;
            if (searchTerm) {
                switch (searchType) {
                    case 'id':
                        matchesSearch = sale.id.toLowerCase().includes(searchLower);
                        break;
                    case 'date':
                        matchesSearch = sale.date.includes(searchTerm);
                        break;
                    case 'paymentMethod':
                        matchesSearch = sale.paymentMethod.toLowerCase().includes(searchLower);
                        break;
                    default:
                        matchesSearch =
                            sale.id.toLowerCase().includes(searchLower) ||
                            sale.date.includes(searchTerm) ||
                            sale.paymentMethod.toLowerCase().includes(searchLower);
                }
            }

            // Filtro por método de pago
            const matchesPaymentMethod = paymentMethodFilter === 'all' || sale.paymentMethod === paymentMethodFilter;

            return matchesSearch && matchesPaymentMethod;
        });
    }, [sales, searchTerm, searchType, paymentMethodFilter]);

    // Calcular estadísticas del día
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(sale => sale.date.startsWith(today));
    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayCount = todaySales.length;

    // Calcular estadísticas totales
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    const handleAddSale = (newSale: Omit<Sale, 'id'>) => {
        const sale: Sale = {
            ...newSale,
            id: `V-${String(sales.length + 1).padStart(3, '0')}`
        };
        setSales([sale, ...sales]); // Agregar al inicio para que aparezca primero
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a', mb: 1 }}>
                        Gestión de Ventas
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra tus ventas y transacciones
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<MdAdd size={20} />}
                    onClick={() => setSaleModalOpen(true)}
                    sx={{
                        bgcolor: '#0f172a',
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        '&:hover': {
                            bgcolor: '#1e293b'
                        }
                    }}
                >
                    Iniciar Venta
                </Button>
            </Box>

            {/* Stats */}
            <VentasStats
                todayCount={todayCount}
                todayTotal={todayTotal}
                totalSales={totalSales}
                averageSale={averageSale}
            />

            {/* Filters and Search */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Buscar por</InputLabel>
                    <Select
                        value={searchType}
                        label="Buscar por"
                        onChange={(e) => setSearchType(e.target.value as any)}
                    >
                        <MenuItem value="all">Todo</MenuItem>
                        <MenuItem value="id">ID</MenuItem>
                        <MenuItem value="date">Fecha</MenuItem>
                        <MenuItem value="paymentMethod">Método de Pago</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    placeholder={
                        searchType === 'date'
                            ? 'Buscar por fecha (YYYY-MM-DD)...'
                            : searchType === 'id'
                                ? 'Buscar por ID...'
                                : searchType === 'paymentMethod'
                                    ? 'Buscar por método de pago...'
                                    : 'Buscar ventas...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: <MdSearch size={20} style={{ marginRight: 8, color: '#64748b' }} />,
                    }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Método de Pago</InputLabel>
                    <Select
                        value={paymentMethodFilter}
                        label="Método de Pago"
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    >
                        <MenuItem value="all">Todos</MenuItem>
                        <MenuItem value="efectivo">Efectivo</MenuItem>
                        <MenuItem value="mercadopago">Mercado Pago</MenuItem>
                        <MenuItem value="cuentadni">Cuenta DNI</MenuItem>
                        <MenuItem value="tarjetacredito">Tarjeta Crédito</MenuItem>
                        <MenuItem value="tarjetadebito">Tarjeta Débito</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Sales Table */}
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3 }}>
                Historial de Ventas ({filteredSales.length})
            </Typography>

            <SalesSearchTable sales={filteredSales} />

            {/* Sale Modal */}
            <SaleModal
                open={saleModalOpen}
                onClose={() => setSaleModalOpen(false)}
                onSave={handleAddSale}
            />
        </Box>
    );
};

export default VentasContent;
