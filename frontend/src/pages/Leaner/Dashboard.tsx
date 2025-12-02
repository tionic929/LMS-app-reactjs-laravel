import React from 'react';
import AnalyticsCard from '../../components/modals/dashboard/widgets/ActionRequiredList';
import ProgressRing from '../../components/modals/dashboard/widgets/ProgressRing';
import CourseProgressChart from '../../components/modals/dashboard/widgets/CourseProgressChart';
import { PiStudentFill, PiUsersThreeBold } from 'react-icons/pi';
import { RiCheckLine, RiMegaphoneLine, RiCalendarCheckLine } from 'react-icons/ri';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { FaPlayCircle } from 'react-icons/fa';

// Mock Data for Learner Dashboard
const mockLearnerData = {
  name: 'Alex Johnson',
  overallProgress: 75,
  courseStats: { enrolled: 5, completed: 2, inProgress: 3 },
  courseActivity: [
    { name: 'Wk 1', activity: 3 },
    { name: 'Wk 2', activity: 5 },
    { name: 'Wk 3', activity: 4 },
    { name: 'Wk 4', activity: 7 },
    { name: 'Wk 5', activity: 6 },
    { name: 'Wk 6', activity: 9 },
  ],
  myCourses: [
    { id: 1, title: 'Introduction to Data Science', progress: 85, next: 'Module 5 Quiz' },
    { id: 2, title: 'Web Development Basics', progress: 42, next: 'Lesson 10: Flexbox' },
    { id: 3, title: 'Advanced React Hooks', progress: 10, next: 'Video: useReducer' },
  ],
  upcoming: [
    { id: 1, title: 'Python Assignment', course: 'Data Science', date: 'Dec 15', type: 'Assignment' },
    { id: 2, title: 'Live Q&A Session', course: 'React Hooks', date: 'Dec 10', type: 'Live Event' },
  ],
  recentAnnouncements: [
    { id: 1, course: 'Data Science', content: 'The final project requirements have been posted.' },
    { id: 2, course: 'Web Dev', content: 'Office hours moved to 3 PM EST this week.' },
  ],
};

interface LearnerDashboardProps {
  data: typeof mockLearnerData;
}

const LearnerDashboard: React.FC<LearnerDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* Header and Welcome */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {data.name}!</h1>
        <p className="text-gray-600 mt-1">Ready to pick up where you left off?</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Courses Enrolled"
          value={data.courseStats.enrolled}
          icon={PiUsersThreeBold}
          color="text-blue-500"
        />
        <AnalyticsCard
          title="Courses Completed"
          value={data.courseStats.completed}
          icon={RiCheckLine}
          color="text-green-500"
        />
        <AnalyticsCard
          title="Assignments Due Soon"
          value={data.upcoming.length}
          icon={RiCalendarCheckLine}
          color="text-red-500"
        />
      </div>

      {/* Main Content Area: Progress and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Ring (1/3 Width) */}
        <div className="lg:col-span-1">
          <ProgressRing progress={data.overallProgress} title="Overall Learning Progress" />
        </div>

        {/* Course Activity Chart (2/3 Width) */}
        <div className="lg:col-span-2">
          <CourseProgressChart
            title="Your Weekly Learning Activity"
            data={data.courseActivity}
            dataKey="activity"
            label="Lessons Completed"
          />
        </div>
      </div>

      {/* Courses and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* My Courses List (3/5 Width) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">My Active Courses</h3>
          <div className="space-y-4">
            {data.myCourses.map(course => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{course.title}</p>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <span className="mr-3">Progress: {course.progress}%</span>
                    <div className="w-32 bg-gray-300 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </div>
                <a
                  href={`/courses/${course.id}`}
                  className="ml-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                >
                  <FaPlayCircle className="h-5 w-5" />
                  {course.next}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines (2/5 Width) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <RiCalendarCheckLine className="h-6 w-6 text-red-500" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {data.upcoming.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-gray-100 pb-2"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500">Course: {item.course}</p>
                </div>
                <span className="text-sm font-medium text-red-600">{item.date}</span>
              </div>
            ))}
            {data.upcoming.length === 0 && <p className="text-gray-500">No upcoming deadlines.</p>}
          </div>
        </div>
      </div>
      
      {/* Announcements Feed */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <RiMegaphoneLine className="h-6 w-6 text-orange-500" />
            Recent Announcements
        </h3>
        <div className="space-y-3">
            {data.recentAnnouncements.map(announcement => (
                <div key={announcement.id} className="border-l-4 border-orange-400 p-3 bg-orange-50 rounded-r-lg">
                    <p className="font-medium text-gray-800">
                        <span className="text-orange-600 font-semibold">{announcement.course}: </span>
                        {announcement.content}
                    </p>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default LearnerDashboard;