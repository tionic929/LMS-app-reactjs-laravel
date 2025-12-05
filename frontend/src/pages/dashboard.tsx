import React, { useEffect, useState } from 'react';
import { getDashboardAnalytics, type DashboardAnalytics } from '../api/analytics';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState<DashboardAnalytics>({
        totalUsers: 0,
        totalInstructors: 0,
        totalLearners: 0,
        totalAnnouncements: 0,
        recentAnnouncements: 0,
    });

    useEffect(() => {
        // Only fetch analytics here
        getDashboardAnalytics()
            .then(data => setAnalytics(data))
            .catch(err => console.error('Error fetching analytics:', err));
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            <div>
                <p><strong>Total Users:</strong> {analytics.totalUsers}</p>
                <p><strong>Total Instructors:</strong> {analytics.totalInstructors}</p>
                <p><strong>Total Learners:</strong> {analytics.totalLearners}</p>
                <p><strong>Total Announcements:</strong> {analytics.totalAnnouncements}</p>
            </div>
        </div>
    );
};

export default Dashboard;
