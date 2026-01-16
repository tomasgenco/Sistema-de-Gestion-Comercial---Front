import { useState, useMemo } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { MdAdd, MdSearch } from 'react-icons/md';
import ProviderCard from './ProviderCard';
import AddProviderModal from './AddProviderModal';
import EditProviderModal from './EditProviderModal';
import PurchaseModal from './PurchaseModal';
import PurchaseHistoryTable from './PurchaseHistoryTable';
import ProveedoresStats from './ProveedoresStats';

export interface Provider {
    id: string;
    name: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
    cuit: string;
    totalPurchases: number;
    lastPurchaseDate: string;
    status: 'active' | 'inactive';
}

export interface Purchase {
    id: string;
    providerId: string;
    providerName: string;
    date: string;
    total: number;
    items: PurchaseItem[];
    status: 'completed' | 'pending' | 'cancelled';
}

export interface PurchaseItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// Datos de ejemplo de proveedores
const initialProviders: Provider[] = [
    {
        id: 'PROV-001',
        name: 'Tech Solutions S.A.',
        contact: 'Juan Pérez',
        email: 'ventas@techsolutions.com',
        phone: '+54 11 4567-8900',
        address: 'Av. Corrientes 1234, CABA',
        cuit: '30-12345678-9',
        totalPurchases: 1250000,
        lastPurchaseDate: '2026-01-10T14:30:00',
        status: 'active'
    },
    {
        id: 'PROV-002',
        name: 'Distribuidora Central',
        contact: 'María González',
        email: 'info@distcentral.com.ar',
        phone: '+54 11 5678-9012',
        address: 'Av. Libertador 5678, CABA',
        cuit: '30-98765432-1',
        totalPurchases: 890000,
        lastPurchaseDate: '2026-01-12T10:15:00',
        status: 'active'
    },
    {
        id: 'PROV-003',
        name: 'Importadora Global',
        contact: 'Carlos Rodríguez',
        email: 'compras@impglobal.com',
        phone: '+54 11 6789-0123',
        address: 'Av. Santa Fe 9012, CABA',
        cuit: '30-11223344-5',
        totalPurchases: 650000,
        lastPurchaseDate: '2026-01-08T16:45:00',
        status: 'active'
    },
    {
        id: 'PROV-004',
        name: 'Mayorista del Sur',
        contact: 'Ana Martínez',
        email: 'ventas@mayoristasur.com',
        phone: '+54 11 7890-1234',
        address: 'Av. Rivadavia 3456, CABA',
        cuit: '30-55667788-9',
        totalPurchases: 420000,
        lastPurchaseDate: '2026-01-05T11:20:00',
        status: 'active'
    }
];

// Datos de ejemplo de compras
const initialPurchases: Purchase[] = [
    {
        id: 'COMP-001',
        providerId: 'PROV-001',
        providerName: 'Tech Solutions S.A.',
        date: '2026-01-10T14:30:00',
        total: 1250000,
        status: 'completed',
        items: [
            { productId: 'P-001', productName: 'Laptop Dell XPS 15', quantity: 1, unitPrice: 1250000, total: 1250000 }
        ]
    },
    {
        id: 'COMP-002',
        providerId: 'PROV-002',
        providerName: 'Distribuidora Central',
        date: '2026-01-12T10:15:00',
        total: 890000,
        status: 'completed',
        items: [
            { productId: 'P-009', productName: 'Procesador Intel i7', quantity: 2, unitPrice: 450000, total: 900000 }
        ]
    }
];

const ProveedoresContent = () => {
    const [providers, setProviders] = useState<Provider[]>(initialProviders);
    const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Filtrar proveedores
    const filteredProviders = useMemo(() => {
        return providers.filter(provider => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                provider.name.toLowerCase().includes(searchLower) ||
                provider.contact.toLowerCase().includes(searchLower) ||
                provider.email.toLowerCase().includes(searchLower) ||
                provider.cuit.includes(searchTerm);

            const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [providers, searchTerm, statusFilter]);

    // Calcular estadísticas
    const totalProviders = providers.length;
    const activeProviders = providers.filter(p => p.status === 'active').length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0);

    const handleAddProvider = (newProvider: Omit<Provider, 'id'>) => {
        const provider: Provider = {
            ...newProvider,
            id: `PROV-${String(providers.length + 1).padStart(3, '0')}`
        };
        setProviders([...providers, provider]);
    };

    const handleEditProvider = (updatedProvider: Provider) => {
        setProviders(providers.map(p => p.id === updatedProvider.id ? updatedProvider : p));
    };

    const handleInitiatePurchase = (provider: Provider) => {
        setSelectedProvider(provider);
        setPurchaseModalOpen(true);
    };

    const handleSavePurchase = (purchase: Omit<Purchase, 'id'>) => {
        const newPurchase: Purchase = {
            ...purchase,
            id: `COMP-${String(purchases.length + 1).padStart(3, '0')}`
        };

        setPurchases([newPurchase, ...purchases]);

        // Actualizar total de compras del proveedor
        setProviders(providers.map(p => {
            if (p.id === purchase.providerId) {
                return {
                    ...p,
                    totalPurchases: p.totalPurchases + purchase.total,
                    lastPurchaseDate: purchase.date
                };
            }
            return p;
        }));
    };

    const handleEdit = (provider: Provider) => {
        setSelectedProvider(provider);
        setEditModalOpen(true);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a', mb: 1 }}>
                        Gestión de Proveedores
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra tus proveedores y compras
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<MdAdd size={20} />}
                    onClick={() => setAddModalOpen(true)}
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
                    Agregar Proveedor
                </Button>
            </Box>

            {/* Stats */}
            <ProveedoresStats
                totalProviders={totalProviders}
                activeProviders={activeProviders}
                totalSpent={totalSpent}
            />

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                    placeholder="Buscar por nombre, contacto, email o CUIT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: <MdSearch size={20} style={{ marginRight: 8, color: '#64748b' }} />,
                    }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Estado"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="all">Todos</MenuItem>
                        <MenuItem value="active">Activos</MenuItem>
                        <MenuItem value="inactive">Inactivos</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Provider Cards */}
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3 }}>
                Proveedores ({filteredProviders.length})
            </Typography>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 3,
                mb: 4
            }}>
                {filteredProviders.map((provider) => (
                    <ProviderCard
                        key={provider.id}
                        provider={provider}
                        onInitiatePurchase={handleInitiatePurchase}
                        onEdit={handleEdit}
                    />
                ))}
            </Box>

            {filteredProviders.length === 0 && (
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: '#f8fafc',
                    borderRadius: 3,
                    border: '2px dashed #cbd5e1'
                }}>
                    <Typography variant="body1" color="text.secondary">
                        No se encontraron proveedores con los filtros aplicados
                    </Typography>
                </Box>
            )}

            {/* Purchase History */}
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', mb: 3, mt: 5 }}>
                Historial de Compras ({purchases.length})
            </Typography>

            <PurchaseHistoryTable purchases={purchases} />

            {/* Modals */}
            <AddProviderModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAddProvider}
            />

            <EditProviderModal
                open={editModalOpen}
                provider={selectedProvider}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedProvider(null);
                }}
                onSave={handleEditProvider}
            />

            <PurchaseModal
                open={purchaseModalOpen}
                provider={selectedProvider}
                onClose={() => {
                    setPurchaseModalOpen(false);
                    setSelectedProvider(null);
                }}
                onSave={handleSavePurchase}
            />
        </Box>
    );
};

export default ProveedoresContent;
