import { Paper, Typography, Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { MdShoppingCart, MdEdit, MdEmail, MdPhone, MdLocationOn, MdBusiness } from 'react-icons/md';
import type { Provider } from './ProveedoresContent';

interface ProviderCardProps {
    provider: Provider;
    onInitiatePurchase: (provider: Provider) => void;
    onEdit: (provider: Provider) => void;
}

const ProviderCard = ({ provider, onInitiatePurchase, onEdit }: ProviderCardProps) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? { bg: '#dcfce7', color: '#16a34a' }
            : { bg: '#fee2e2', color: '#dc2626' };
    };

    const statusColors = getStatusColor(provider.status);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    borderColor: '#0f172a'
                }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', mb: 0.5 }}>
                        {provider.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {provider.id}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label={provider.status === 'active' ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                            bgcolor: statusColors.bg,
                            color: statusColors.color,
                            fontWeight: 600
                        }}
                    />
                    <Tooltip title="Editar proveedor">
                        <IconButton
                            size="small"
                            onClick={() => onEdit(provider)}
                            sx={{
                                bgcolor: '#eff6ff',
                                color: '#1e40af',
                                '&:hover': {
                                    bgcolor: '#dbeafe'
                                }
                            }}
                        >
                            <MdEdit size={16} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Contact Info */}
            <Box sx={{ flex: 1, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <MdBusiness size={16} color="#64748b" />
                    <Typography variant="body2" color="text.secondary">
                        {provider.contact}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <MdEmail size={16} color="#64748b" />
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                        {provider.email}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <MdPhone size={16} color="#64748b" />
                    <Typography variant="body2" color="text.secondary">
                        {provider.phone}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <MdLocationOn size={16} color="#64748b" style={{ marginTop: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                        {provider.address}
                    </Typography>
                </Box>
            </Box>

            {/* Stats */}
            <Box sx={{
                bgcolor: '#f8fafc',
                borderRadius: 2,
                p: 2,
                mb: 2,
                border: '1px solid #e2e8f0'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Total Compras:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>
                        ${provider.totalPurchases.toLocaleString('es-AR')}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                        Última Compra:
                    </Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#64748b' }}>
                        {formatDate(provider.lastPurchaseDate)}
                    </Typography>
                </Box>
            </Box>

            {/* Actions */}
            <Button
                variant="contained"
                fullWidth
                startIcon={<MdShoppingCart size={18} />}
                onClick={() => onInitiatePurchase(provider)}
                sx={{
                    bgcolor: '#0f172a',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.2,
                    '&:hover': {
                        bgcolor: '#1e293b'
                    }
                }}
            >
                Iniciar Compra
            </Button>
        </Paper>
    );
};

export default ProviderCard;
