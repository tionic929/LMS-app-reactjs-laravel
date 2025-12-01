import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Type Definitions for Clarity ---
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
    // Add other properties if you need to chart them
}

// ------------------------------------

// Updated API call to fetch the snapshot data
const getSnapshotData = async (): Promise<AnalyticsSnapshot> => {
    try {
        const response = await api.get('/users/analytics');
        return response.data;
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        // Return a mock structure on failure
        return {
            totalUsers: 0,
            totalInstructors: 0,
            totalLearners: 0,
            totalAnnouncements: 0,
            activeUsers: 0,
            unconfirmedInstructors: 0,
            bannedUsers: 0,
        };
    }
};

/**
 * Transforms the single snapshot object into an array suitable for Recharts.
 * We'll focus on the core user and administrative totals.
 */
const transformSnapshotToChartData = (snapshot: AnalyticsSnapshot): ChartDataPoint[] => {
    return [
        { name: 'Total Users', value: snapshot.totalUsers },
        { name: 'Total Instructors', value: snapshot.totalInstructors },
        { name: 'Total Learners', value: snapshot.totalLearners },
        { name: 'Active Users', value: snapshot.activeUsers },
        { name: 'Unconfirmed Instructors', value: snapshot.unconfirmedInstructors },
        { name: 'Banned Users', value: snapshot.bannedUsers },
        { name: 'Total Announcements', value: snapshot.totalAnnouncements },
    ].filter(item => item.value > 0); // Filter out zero values if desired
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

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading analytics data...</div>;
    }

    if (chartData.length === 0) {
        return <div className="p-6 text-center text-gray-500">No data available for chart visualization.</div>;
    }

    // Charting the transformed data (snapshot totals) as a BarChart
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">User & System Totals Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    
                    {/* The Bar component will use the dataKey "value" */}
                    <Bar dataKey="value" name="Count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartAnalytics;