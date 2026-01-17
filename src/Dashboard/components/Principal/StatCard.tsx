import { Paper, Typography, Box } from '@mui/material';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import type { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
    type?: 'positive' | 'negative' | 'neutral';
}

const StatCard = ({ title, value, trend, trendValue, type }: StatCardProps) => {
    const isUp = trend === 'up';
    const trendColor = type === 'positive' ? '#10b981' : type === 'negative' ? '#ef4444' : '#3b82f6';

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                height: '100%',
                border: '1px solid #e2e8f0',
                p: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    borderColor: trendColor
                }
            }}
        >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={500}>
                {title}
            </Typography>
            <Box display="flex" alignItems="end" mb={1}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#0f172a' }}>
                    {value}
                </Typography>
            </Box>
            {trendValue && (
                <Box display="flex" alignItems="center" gap={0.5}>
                    {isUp ? <MdTrendingUp color={trendColor} /> : <MdTrendingDown color={trendColor} />}
                    <Typography variant="body2" fontWeight={600} sx={{ color: trendColor }}>
                        {trendValue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        vs ayer
                    </Typography>
                </Box>
            )}
        </Paper>
    );

};

export default StatCard;
