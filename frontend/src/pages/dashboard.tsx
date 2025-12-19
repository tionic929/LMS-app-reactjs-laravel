import React, { createContext, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, BookOpen, CheckCircle, Database, Server } from 'lucide-react';

// =========================================================================
// CRITICAL FIX: Inline Mock Context to resolve compilation error
// =========================================================================
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (message: string, type?: NotificationType, duration?: number) => void;
  removeNotification: (id: number) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const defaultContextValue: NotificationContextValue = {
  notifications: [
    { id: 101, message: "System maintenance complete. All services online.", type: 'success' },
    { id: 102, message: "High server load detected. Monitoring performance.", type: 'error' },
    { id: 103, message: "New instructor application awaiting review.", type: 'warning' },
  ],
  addNotification: () => {},
  removeNotification: () => {},
  refreshTrigger: 0,
  triggerRefresh: () => {},
};

const NotificationContext = createContext<NotificationContextValue>(defaultContextValue);

export const useNotification = (): NotificationContextValue => {
  return useContext(NotificationContext);
};
// =========================================================================

// --- Mock Data for Admin Dashboard ---

// 1. Mock Data for Stats Cards
const adminStats = [
  { icon: Users, label: "Total Learners", value: "8,542", trend: "+12% vs last month", color: "bg-blue-500" },
  { icon: BookOpen, label: "Active Courses", value: "78", trend: "+3 new this week", color: "bg-green-500" },
  { icon: CheckCircle, label: "Avg. Completion Rate", value: "68.5%", trend: "↑ 2.1% in Q4", color: "bg-yellow-500" },
  { icon: Server, label: "New Instructor Apps", value: "4", trend: "Review pending", color: "bg-red-500" },
];

// 2. Mock Data for Enrollment Trend (Line Chart)
const enrollmentTrendData = [
  { name: 'Jan', Learners: 4000, Instructors: 2400 },
  { name: 'Feb', Learners: 3000, Instructors: 1398 },
  { name: 'Mar', Learners: 2000, Instructors: 9800 },
  { name: 'Apr', Learners: 2780, Instructors: 3908 },
  { name: 'May', Learners: 1890, Instructors: 4800 },
  { name: 'Jun', Learners: 2390, Instructors: 3800 },
  { name: 'Jul', Learners: 3490, Instructors: 4300 },
];

// 3. Mock Data for Top Courses (Bar Chart)
const topCoursesData = [
    { name: 'React Dev', Enrollment: 1520, Score: 92 },
    { name: 'Laravel API', Enrollment: 1210, Score: 88 },
    { name: 'Tailwind CSS', Enrollment: 980, Score: 95 },
    { name: 'DB Fun', Enrollment: 750, Score: 81 },
    { name: 'Vue.js', Enrollment: 550, Score: 89 },
];

// 4. Mock Data for User Role Distribution (Pie Chart)
const userRoleData = [
  { name: 'Learners', value: 8542, color: '#3b82f6' },
  { name: 'Instructors', value: 350, color: '#10b981' },
  { name: 'Admins', value: 12, color: '#ef4444' },
];

// --- Utility Components ---

interface CardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  color: string;
}

const StatCard: React.FC<CardProps> = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-40 transition hover:shadow-2xl hover:scale-[1.02] duration-300">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <p className="text-xs text-gray-400 mt-2 truncate">{trend}</p>
  </div>
);

interface NotificationListProps {
  notifications: Notification[];
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p>No unread notifications.</p>
      </div>
    );
  }

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="space-y-3">
      {recentNotifications.map((n) => (
        <a 
          key={n.id} 
          href={'#'} 
          className={`block p-3 rounded-lg shadow-md hover:shadow-lg transition duration-150 border-l-4 ${
            n.type === 'error' ? 'border-red-500 bg-red-50' :
            n.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
            n.type === 'success' ? 'border-green-500 bg-green-50' :
            'border-blue-500 bg-blue-50'
          }`}
        >
          <div className="text-sm font-semibold text-gray-800 truncate">{n.message}</div>
          <div className="text-xs text-gray-500 mt-1">{n.type.toUpperCase()} alert</div>
        </a>
      ))}
    </div>
  );
};

// --- Main Dashboard Component ---

const AdminDashboard: React.FC = () => {
  const { notifications } = useNotification();
  
  const renderRoleCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-xs">
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-5">
      <h1 className="text-4xl justify-center font-extrabold text-gray-900 mb-6 border-b pb-2">Dashboard</h1>

      {/* --- 1. Top Level Statistics Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {adminStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* --- 2. Main Charts Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Chart 1: Course Performance (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Top 5 Enrolled Courses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCoursesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#374151" className="text-xs" angle={-15} textAnchor="end" height={50} />
              <YAxis yAxisId="left" stroke="#374151" />
              <YAxis yAxisId="right" orientation="right" stroke="#dc2626" label={{ value: 'Avg Score', angle: -90, position: 'insideRight' }}/>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} 
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="Enrollment" fill="#1d4ed8" radius={[10, 10, 0, 0]} />
              <Bar yAxisId="right" dataKey="Score" fill="#dc2626" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart 2: User Role Distribution (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">User Role Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
                label={renderRoleCustomizedLabel}
              >
                {userRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* --- 3. Engagement and Notifications Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 3: Enrollment Trend (Line Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Enrollment Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} 
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Line type="monotone" dataKey="Learners" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Instructors" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Component 4: Latest Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-indigo-500" />
            System Events & Alerts
          </h2>
          <NotificationList notifications={notifications} />
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;