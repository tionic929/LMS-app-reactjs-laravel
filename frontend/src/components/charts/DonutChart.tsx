import React, { useState, useEffect, memo } from 'react';
import api from '../../api/axios';
import { 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

// --- Type Definitions (Replicated from your code block for completeness) ---
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
    fill?: string; // Add fill property for custom colors

    [key: string]: any;
}

// --- Data Fetching (Replicated for component context) ---
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

// 🛑 UTILITY FUNCTION FOR DONUT CHART 🛑
const transformSnapshotToDonutData = (snapshot: AnalyticsSnapshot): ChartDataPoint[] => {
    // Focus on the status of users relative to the total users
    const data: ChartDataPoint[] = [
        { name: 'Active Users', value: snapshot.activeUsers, fill: '#3b82f6' }, // Blue
        { name: 'Unconfirmed Instructors', value: snapshot.unconfirmedInstructors, fill: '#f97316' }, // Orange
        { name: 'Banned Users', value: snapshot.bannedUsers, fill: '#ef4444' }, // Red
    ].filter(item => item.value > 0);
    
    // Calculate "Other/Remaining Users" to complete the composition
    const countedUsers = data.reduce((sum, item) => sum + item.value, 0);
    const remainingUsers = snapshot.totalUsers - countedUsers;

    if (remainingUsers > 0) {
        // If the remaining users are the majority, adjust the total count for better visualization
        const totalOtherUsers = snapshot.totalUsers - (snapshot.activeUsers + snapshot.bannedUsers);
        
        // Use Learners/Instructors if they are the majority of the remaining pool
        const inactiveOrLearnerInstructorPool = snapshot.totalLearners + snapshot.totalInstructors - countedUsers;

        data.push({ 
            name: 'Inactive/Other Users', 
            value: totalOtherUsers > 0 ? totalOtherUsers : remainingUsers, 
            fill: '#94a3b8' // Gray
        });
    }

    return data;
};


const DonutChartUserComposition = () => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSnapshotData().then(snapshot => {
            const transformedData = transformSnapshotToDonutData(snapshot);
            setChartData(transformedData);
            setTotalUsers(snapshot.totalUsers);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-6 text-center text-gray-500">Loading user composition...</div>;
    if (chartData.length === 0) return <div className="p-6 text-center text-gray-500">No composition data available.</div>;

    // Custom tool-tip to show the percentage of the total
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / totalUsers) * 100).toFixed(1);
            return (
                <div className="bg-white p-2 border border-gray-300 shadow-md text-sm">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-gray-700">Count: {data.value.toLocaleString()}</p>
                    <p className="text-gray-700">Percentage: {percentage}%</p>
                </div>
            );
        }
        return null;
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">User Status Composition (Total: {totalUsers.toLocaleString()})</h3>
            
            <ResponsiveContainer width="100%" height={300} debounce={300}>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Position Legend at the bottom */}
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '10px' }} />

                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60} // Creates the donut hole
                        outerRadius={100} // Outer size of the donut
                        paddingAngle={2} // Gap between slices
                        fill="#8884d8" // Default fill (overridden by data.fill)
                        animationDuration={500}
                        animationEasing="ease-in-out"
                    >
                        {/* We use the fill property in the data object, so we don't need a map here */}
                        {/* You can add Cell if you want complex hover effects or label customization */}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default memo(DonutChartUserComposition);