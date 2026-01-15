import { Card, CardContent, Typography, Box } from '@mui/material';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

interface StatCardProps {
    title: string;
    value: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    type?: 'positive' | 'negative' | 'neutral';
}

const StatCard = ({ title, value, trend, trendValue, type }: StatCardProps) => {
    const isUp = trend === 'up';
    const trendColor = type === 'positive' ? '#10b981' : type === 'negative' ? '#ef4444' : '#3b82f6';

    return (
        <Card elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid #e2e8f0' }}>
            <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={500}>
                    {title}
                </Typography>
                <Box display="flex" alignItems="end" mb={1}>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#0f172a' }}>
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
            </CardContent>
        </Card>
    );
};

export default StatCard;
