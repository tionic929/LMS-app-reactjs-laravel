import React, { useState, useEffect, memo } from 'react';
import api from '../../api/axios';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

// ... (Type definitions remain the same) ...
interface AnalyticsSnapshot {
    totalUsers: number;
    totalInstructors: number;
    totalLearners: number;
    totalAnnouncements: number;
    activeUsers: number;
    unconfirmedInstructors: number;
    bannedUsers: number;
}

interface ChartDataPoint {
    name: string;
    value: number;
}

// ... (getSnapshotData and transformSnapshotToChartData remain the same) ...
const getSnapshotData = async (): Promise<AnalyticsSnapshot> => {
    try {
        const response = await api.get('/users/analytics');
        return response.data;
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return {
            totalUsers: 0, totalInstructors: 0, totalLearners: 0,
            totalAnnouncements: 0, activeUsers: 0, unconfirmedInstructors: 0, bannedUsers: 0,
        };
    }
};

const transformSnapshotToChartData = (snapshot: AnalyticsSnapshot): ChartDataPoint[] => {
    return [
        { name: 'Total Users', value: snapshot.totalUsers },
        { name: 'Total Instructors', value: snapshot.totalInstructors },
        { name: 'Total Learners', value: snapshot.totalLearners },
        { name: 'Active Users', value: snapshot.activeUsers },
        { name: 'Unconfirmed Instructors', value: snapshot.unconfirmedInstructors },
        { name: 'Banned Users', value: snapshot.bannedUsers },
        { name: 'Total Announcements', value: snapshot.totalAnnouncements },
    ].filter(item => item.value >= 0);
};

const BarChartAnalytics = () => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSnapshotData().then(snapshot => {
            const transformedData = transformSnapshotToChartData(snapshot);
            setChartData(transformedData);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-6 text-center text-gray-500">Loading analytics data...</div>;
    if (chartData.length === 0) return <div className="p-6 text-center text-gray-500">No data available.</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Current System Totals</h3>
            
            {/* debounce={300} -> Waits for sidebar transition to finish.
                The resize "snap" happens at 300ms.
            */}
            <ResponsiveContainer width="100%" height={300} debounce={300}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => (value as number).toLocaleString()} />
                    <Legend />
                    
                    {/* 1. Removed isAnimationActive={false} (Animations are now ON)
                       2. Added animationDuration={500}: Makes the "growth" into the new size feel smooth.
                    */}
                    <Bar 
                        dataKey="value" 
                        name="Count" 
                        fill="#4F46E5" 
                        radius={[0, 4, 4, 0]} 
                        animationDuration={500} 
                        animationEasing="ease-in-out"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default memo(BarChartAnalytics);