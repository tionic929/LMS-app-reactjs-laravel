import React, { Component } from 'react'
import '../App.css'
const cardcounters = [
  { title: 'total users', count: 1500 },
  { title: 'total instructors', count: 300 },
  { title: 'total learners', count: 1200 },
  { title: 'total reports', count: 75 },
];

class Dashboard extends Component {
  
  render() {
  return (
    <>
        <main className="flex-1 overflow-auto p-6">

          {/* card counters section */}
          <div className="max-w-6xl flex gap-8 px-8  mx-auto">
            <div className="card flex p-4 w-[30vh] h-[15vh] bg-gray-100/40 border-2 border-blue-900/70 rounded-2xl hover:bg-blue-700/70 hover:text-white hover:bg-gradient-to-r from-blue-700/70 to-blue-900 hover:shadow-lg hover:shadow-gray-700/50 cursor-pointer transition-all duration-200 group">
                <div className="container items-center justify-center">
                  <p className="text-lg text-gray-500 font-medium group-hover:text-white">total users</p>
                  <span className="text-5xl font-bold text-gray-800 group-hover:text-white">{ cardcounters[0].count }</span>
                </div>
            </div>
            <div className="card flex p-4 w-[30vh] h-[15vh] bg-gray-100 border-2 border-blue-900/70 rounded-2xl hover:bg-blue-700/70 hover:text-white hover:bg-gradient-to-r from-blue-700/70 to-blue-900 hover:shadow-lg hover:shadow-gray-700/50 cursor-pointer transition-all duration-200 group">
                <div className="container items-center justify-center">
                  <p className="text-lg text-gray-500 font-medium group-hover:text-white">total instructors</p>
                  <span className="text-5xl font-bold text-gray-800 group-hover:text-white">{ cardcounters[1].count }</span>
                </div>
            </div>
            <div className="card flex p-4 w-[30vh] h-[15vh] bg-gray-100 border-2 border-blue-900/70 rounded-2xl hover:bg-blue-700/70 hover:text-white hover:bg-gradient-to-r from-blue-700/70 to-blue-900 hover:shadow-lg hover:shadow-gray-700/50 cursor-pointer transition-all duration-200 group">
                <div className="container items-center justify-center">
                  <p className="text-lg text-gray-500 font-medium group-hover:text-white">total learners</p>
                  <span className="text-5xl font-bold text-gray-800 group-hover:text-white">{ cardcounters[2].count }</span>
                </div>
            </div>
            <div className="card flex p-4 w-[30vh] h-[15vh] bg-gray-100 border-2 border-blue-900/70 rounded-2xl hover:bg-blue-700/70 hover:text-white hover:bg-gradient-to-r from-blue-700/70 to-blue-900 hover:shadow-lg hover:shadow-gray-700/50 cursor-pointer transition-all duration-200 group">
                <div className="container items-center justify-center">
                  <p className="text-lg text-gray-500 font-medium group-hover:text-white">total reports</p>
                  <span className="text-5xl font-bold text-gray-800 group-hover:text-white">{ cardcounters[3].count }</span>
                </div>
            </div>
          </div>

          <div className="my-8 max-w-6xl mx-auto">
          
          </div>
        </main>
    </>
  )
}
}

export default Dashboard