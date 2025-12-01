import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Assuming you'll create a new API function here for historical data (e.g., getHistoricalUserData)

// --- SIMULATED API CALL ---
const getHistoricalUserData = async () => {
    // In a real app, this would be an API call, e.g., api.get('/analytics/user-history')
    // We use your static data here for demonstration:
    return [
        { name: 'Mon', 'Users Added': 4000, 'Courses Completed': 2400 },
        { name: 'Tue', 'Users Added': 3000, 'Courses Completed': 1398 },
        { name: 'Wed', 'Users Added': 2000, 'Courses Completed': 9800 },
        { name: 'Thu', 'Users Added': 2780, 'Courses Completed': 3908 },
        { name: 'Fri', 'Users Added': 1890, 'Courses Completed': 4800 },
    ];
};
// ----------------------------


const LineChartUsers = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHistoricalUserData().then(data => {
            setChartData(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading historical data...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Weekly User & Course Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={chartData} // Using fetched data
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    
                    <Line type="monotone" dataKey="Users Added" stroke="#4F46E5" activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="Courses Completed" stroke="#10B981" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChartUsers;