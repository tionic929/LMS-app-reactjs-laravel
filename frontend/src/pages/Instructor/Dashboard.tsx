import React from 'react';
import AnalyticsCard from '../../components/modals/dashboard/widgets/AnalyticsCard';
import CourseProgressChart from '../../components/modals/dashboard/widgets/CourseProgressChart';
import ActionRequiredList from '../../components/modals/dashboard/widgets/ActionRequiredList';
import { PiUsersThreeBold, PiNotebookDuotone } from 'react-icons/pi';
import { RiCheckLine, RiMegaphoneLine, RiArrowUpLine } from 'react-icons/ri';
import { HiOutlineBookOpen, HiOutlinePlus } from 'react-icons/hi';
import { FaChartLine, FaEnvelopeOpenText } from 'react-icons/fa';

// Mock Data for Instructor Dashboard
const mockInstructorData = {
  name: 'Jane Doe',
  stats: {
    totalCourses: 8,
    totalLearners: 452,
    avgCompletionRate: 68.5,
    newEnrollments: 25,
  },
  actionItems: [
    { id: 1, type: 'request' as const, courseTitle: 'Web Development Basics', details: 'Pending join request from John Smith.', link: '/courses/2/requests' },
    { id: 2, type: 'submission' as const, courseTitle: 'Advanced React Hooks', details: '3 ungraded submissions for Final Project.', link: '/courses/3/assignments' },
    { id: 3, type: 'request' as const, courseTitle: 'Introduction to Data Science', details: 'Pending join request from Alice Kim.', link: '/courses/1/requests' },
  ],
  learnerActivity: [
    { name: 'Mon', activity: 55 },
    { name: 'Tue', activity: 68 },
    { name: 'Wed', activity: 49 },
    { name: 'Thu', activity: 72 },
    { name: 'Fri', activity: 90 },
    { name: 'Sat', activity: 40 },
    { name: 'Sun', activity: 35 },
  ],
  courseSummary: [
    { id: 1, title: 'Data Science', learners: 150, completion: 75, avgGrade: 'A-' },
    { id: 2, title: 'Web Dev Basics', learners: 200, completion: 60, avgGrade: 'B+' },
    { id: 3, title: 'React Hooks', learners: 102, completion: 65, avgGrade: 'A' },
  ]
};

interface InstructorDashboardProps {
  data: typeof mockInstructorData;
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* Header and Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600 mt-1">Hello {data.name}, here are your key performance indicators and action items.</p>
        <div className="mt-4 flex gap-4">
            <a href="/courses/new" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2 font-medium">
                <HiOutlinePlus className="h-5 w-5" />
                New Course
            </a>
            <a href="/messages" className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 inline-flex items-center gap-2 font-medium">
                <FaEnvelopeOpenText className="h-4 w-4" />
                Check Messages
            </a>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Learners"
          value={data.stats.totalLearners}
          icon={PiUsersThreeBold}
          color="text-indigo-500"
        />
        <AnalyticsCard
          title="Total Courses"
          value={data.stats.totalCourses}
          icon={HiOutlineBookOpen}
          color="text-green-500"
        />
        <AnalyticsCard
          title="Avg. Completion Rate"
          value={`${data.stats.avgCompletionRate}%`}
          icon={RiArrowUpLine}
          color="text-amber-500"
        />
        <AnalyticsCard
          title="New Enrollments (Last 7 Days)"
          value={data.stats.newEnrollments}
          icon={FaChartLine}
          color="text-red-500"
        />
      </div>

      {/* Main Content Area: Action Required and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Action Required (2/5 Width) */}
        <div className="lg:col-span-2">
          <ActionRequiredList items={data.actionItems} />
        </div>

        {/* Learner Activity Chart (3/5 Width) */}
        <div className="lg:col-span-3">
          <CourseProgressChart
            title="Learner Activity (Last 7 Days)"
            data={data.learnerActivity}
            dataKey="activity"
            label="Active Users"
          />
        </div>
      </div>
      
      {/* Course Summary Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PiNotebookDuotone className="h-6 w-6 text-gray-500" />
            My Course Summary
        </h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learners</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Grade</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.courseSummary.map(course => (
                        <tr key={course.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.learners}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.completion}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.avgGrade}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href={`/courses/${course.id}`} className="text-blue-600 hover:text-blue-900">View/Edit</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;