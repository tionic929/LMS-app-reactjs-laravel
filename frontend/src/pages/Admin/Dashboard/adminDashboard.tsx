import React, { useState, useEffect, useCallback, lazy } from 'react';
import { FaUser, FaUsers, FaUserClock, FaBan, FaUserGraduate, FaRegUser } from "react-icons/fa";
import { Link } from 'react-router-dom';

import MetricCard from '../../../components/cards/MetricCard';
import StatCard from '../../../components/cards/StatCard';
// import RegistrationTrendLineChart from '../../../components/charts/RegistrationTrendLineChart';
const RegistrationTrendLineChart = lazy(() => import('../../../components/charts/RegistrationTrendLineChart'));
const InstructorApplicationChart = lazy(() => import('../../../components/charts/InstructorApplicationChart'));
// import InstructorApplicationChart from '../../../components/charts/InstructorApplicationChart';

import { getRegistrationTrend, type RegistrationTrend } from '../../../api/learners';
import { getUsersAnalytics, type UserAnalytics } from '../../../api/users'; 
import { getInstructorAnalytics, getPendingApplications, type InstructorAnalytics } from '../../../api/instructorApplications';
import PendingApplicationsCard from '../../../components/cards/PendingApplicationsCard';

interface ChartDataItem{
    name: string,
    Learners: number,
    Instructors: number,
    [key: string]: string | number;
}

const InitialTrendState: RegistrationTrend[] = [];

const InitialInstructorAnalyticsState: InstructorAnalytics = {
    totalApproved: 0,
    totalPending: 0,
    totalRejected: 0,
    total_count: 0,
    data: []
};

const InitialAnalyticsState: UserAnalytics = {
    totalUsers: 0,
    totalLearners: 0,
    totalInstructors: 0,
    activeUsers: 0,
    pendingApplications: 0,
    bannedUsers: 0,
};

const AdminDashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<UserAnalytics>(InitialAnalyticsState);
    const [learnerTrend, setLearnerTrend] = useState<RegistrationTrend[]>(InitialTrendState);
    const [instructorAnalytics, setInstructorAnalytics] = useState<InstructorAnalytics>(InitialInstructorAnalyticsState);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [trendLoading, setTrendLoading] = useState(true);
    const [instructorLoading, setInstructorLoading] = useState(true);


    const fetchAnalytics = useCallback(async () => {
      setAnalyticsLoading(true);
          try{
            const data = await getUsersAnalytics();
            setAnalytics(data);
          } catch (err){
            console.error("Failed to fetch analytics", err);
          } finally {
            setAnalyticsLoading(false);
          }
    }, []);

    const fetchLearnerTrend = useCallback(async() => {
        setTrendLoading(true);
        try{
            const data = await getRegistrationTrend();
            setLearnerTrend(data);
        } catch(err){
            console.error("Failed to fetch learner trend", err);
        } finally {
            setTrendLoading(false);
        }
    }, []);

    const fetchInstructorAnalytics = useCallback(async() => {
        setInstructorLoading(true);
        try{
            const data = await getInstructorAnalytics();
            
            const safeAnalytics: InstructorAnalytics = {
                totalApproved: Number(data.totalApproved || 0),
                totalPending: Number(data.totalPending || 0),
                totalRejected: Number(data.totalRejected || 0),
                
                // List data for the METRIC CARD (total_count must be number)
                total_count: Number(data.total_count || 0),
                data: data.data || [],
            };

            setInstructorAnalytics(safeAnalytics);
        } catch(err){
            console.error("Failed to fetch instructor application data:", err);
        } finally {
            setInstructorLoading(false);
        }
    }, []);

    // const fetchPendingApplications = useCallback(async() => {
    //     setInstructorLoading(true);
    //     try{
    //         const data = await getPendingApplications();
    //         setInstructorAnalytics(data);
    //     } catch(err){
    //         console.error("Failed to fetch learner trend", err);
    //     } finally {
    //         setInstructorLoading(false);
    //     }
    // }, []);

    useEffect(() => {
        fetchAnalytics();
        fetchLearnerTrend();
        fetchInstructorAnalytics();
        // fetchPendingApplications();
    }, [fetchAnalytics, fetchLearnerTrend, fetchInstructorAnalytics]);

    const formattedLearnerTrend: ChartDataItem[] = learnerTrend.map (item => ({
        //item.(variable) must match that of return response json variables in its query in the controller.
        name: item.registrationMonth,
        Learners: item.Learners,
        Instructors: item.Instructors,
    })) 

    return (
        <section className="mb-8 p-6">
            {/* <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2> */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
                {analyticsLoading || !analytics ? (
                    <>
                        {/* 1. SKELETON: Group for the four small metric cards (Spans 3 columns) */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:col-span-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={`skel-small-${i}`} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-[16vh] animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                                    <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>

                        {/* 2. SKELETON: Large skeleton for the Pending Applications card (Spans 3 columns) */}
                        <div className="lg:col-span-3">
                            <div key="skel-large" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-[35vh] animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="h-12 bg-gray-300 rounded w-1/5"></div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:col-span-3">
                            <div className="grid grid-cols-1 gap-6 lg:col-span-2">
                                <MetricCard
                                    icon={FaUsers}
                                    title="Users"
                                    value={analytics.totalUsers.toLocaleString()}
                                    color="bg-blue-600"
                                    cardColor="bg-slate-50/50 shadow-slate-200/50"
                                    cardClassName="text-slate-800"
                                />
                                
                                <MetricCard
                                    icon={FaUserGraduate}
                                    title="Learners"
                                    value={analytics.totalLearners.toLocaleString()}
                                    color="bg-green-600"
                                    cardColor="bg-slate-50/50 shadow-slate-200/50"
                                    cardClassName="text-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:col-span-2 gap-6">
                                <MetricCard
                                    icon={FaRegUser}
                                    title="Instructors"
                                    value={analytics.totalInstructors.toLocaleString()}
                                    color="bg-amber-800"
                                    cardColor="bg-slate-50/50 shadow-slate-200/50"
                                    cardClassName="text-slate-800"
                                />
                                
                                <MetricCard
                                    icon={FaBan}
                                    title="Banned Users"
                                    value={analytics.bannedUsers.toLocaleString()}
                                    color="bg-red-600"
                                    cardColor="bg-slate-50/50 shadow-slate-200/50"
                                    cardClassName="text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <Link to="/instructor-applications" className="block group h-full"> {/* Ensure link and group span full height */}
                                <PendingApplicationsCard
                                    icon={FaUserClock}
                                    title="Total Pending Applications"
                                    totalCount={instructorAnalytics.total_count} // Assuming the object has a total_count
                                    applications={instructorAnalytics.data}
                                    color="bg-amber-500"
                                    cardClassName="h-full" // Ensure the card takes full height of the parent div
                                />
                            </Link>
                        </div>
                    </>
                )}
            </div>  

            {/* <div className="border-b-2 mt-6" /> */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 py-6">
                <div className="sm:col-span-1 min-h-[400px]">
                    {instructorLoading ? (
                        [...Array(1)].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[490px] animate-pulse">
                                <div className="h-8 bg-gray-300 rounded w-1/4 mb-3"></div>   
                                <div className="h-[250px] bg-gray-200 rounded w-full mb-3"></div>
                                <div className="h-8 bg-gray-300 rounded w-full"></div>   
                            </div>
                        ))
                    ) : (
                        
                    <InstructorApplicationChart
                        analytics={instructorAnalytics}
                         />
                    )}
                </div>

                <div className="sm:col-span-3 min-h-[400px]">
                    {trendLoading ? (
                        [...Array(1)].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[490px] animate-pulse">
                                <div className="h-8 bg-gray-300 rounded w-1/4 mb-3"></div>   
                                <div className="h-[250px] bg-gray-200 rounded w-full mb-3"></div>
                                <div className="h-8 bg-gray-300 rounded w-full"></div>
                            </div>
                        ))
                    ) : (

                    <RegistrationTrendLineChart
                            data={formattedLearnerTrend}
                            title="Monthly Registration Analysis"
                            primaryDataKey="Learners"
                            secondaryDataKey="Instructors"  
                        />
                    )}
                </div>
            </div>
        </section>
    );
};

export default AdminDashboard;