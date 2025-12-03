import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardAnalytics, type DashboardAnalytics } from '../api/analytics';
import { FaUsers, FaChalkboardTeacher, FaUserGraduate, FaBell } from 'react-icons/fa'; // Icons for the cards
import LineChartUsers from '../components/charts/LineChartUsers';
import { fetchUser, isInstructorApproved } from "../api/auth";
import '../App.css'; // Assuming your CSS is here

// Helper component for the Metric Cards
const MetricCard = ({ title, count, icon: Icon, color } : {
    title: any;
    count: any;
    icon: any;
    color: any;
}) => (
    <div className={`card flex p-4 w-full h-[15vh] bg-gray-100/40 border-2 border-blue-900/70 rounded-2xl hover:bg-blue-700/70 hover:text-white hover:bg-gradient-to-r from-blue-700/70 to-blue-900 hover:shadow-lg hover:shadow-gray-700/50 cursor-pointer transition-all duration-200 group flex-row items-center justify-between min-w-[200px] ${color}`}>
        <div className="container items-start justify-center">
            <p className="text-lg text-gray-500 font-medium group-hover:text-white capitalize transition-colors duration-200">{title}</p>
            <span className="text-5xl font-bold text-gray-800 group-hover:text-white transition-colors duration-200">{count.toLocaleString()}</span>
        </div>
        <div className="text-gray-400 group-hover:text-white transition-colors duration-200">
            <Icon className="w-12 h-12 opacity-60 group-hover:opacity-80" />
        </div>
    </div>
);

const Dashboard = () => {
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            const data = await getDashboardAnalytics();
            setAnalytics(data);
            setLoading(false);
        };
        fetchAnalytics();
            const checkInstructorApproval = async () => {
        try {
            const { data: user } = await fetchUser();

            if (!isInstructorApproved(user)) {
            toast.warning("Your instructor application is pending approval.");
            navigate("/"); // or any safe page for learners
            }
        } catch (err) {
            console.error("Error fetching user:", err);
        }
        };

        checkInstructorApproval();
    }, [navigate]);

    const cardCounters = analytics ? [
        { title: 'Total Users', count: analytics.totalUsers, icon: FaUsers, color: 'hover:bg-indigo-700/70' },
        { title: 'Total Instructors', count: analytics.totalInstructors, icon: FaChalkboardTeacher, color: 'hover:bg-green-700/70' },
        { title: 'Total Learners', count: analytics.totalLearners, icon: FaUserGraduate, color: 'hover:bg-teal-700/70' },
        { title: 'Total Announcements', count: analytics.totalAnnouncements, icon: FaBell, color: 'hover:bg-red-700/70' },
    ] : [];

    return (
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Admin Dashboard </h1>

                {/* Card Counters Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
                  <div className="col-span-full">
                    <LineChartUsers />
                  </div>
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-gray-500 text-lg">Loading dashboard metrics...</div>
                    ) : (
                        cardCounters.map((card, index) => (
                            <MetricCard 
                                key={index} 
                                title={card.title} 
                                count={card.count} 
                                icon={card.icon} 
                                color={card.color} 
                            />
                        ))
                    )}
                </div>

                <div className="my-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Activity Summary</h2>
                    <p className="text-gray-600">
                        {loading ? 
                            "Awaiting data..." : 
                            `We currently have ${analytics?.totalUsers.toLocaleString()} users, and have posted ${analytics?.totalAnnouncements.toLocaleString()} announcements, with ${analytics?.recentAnnouncements.toLocaleString()} new announcements in the past week.`}
                    </p>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;