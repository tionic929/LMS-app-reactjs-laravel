import { useMemo, useState } from 'react'

type Role = 'instructor' | 'student'

interface User {
	id: number
	name: string
	email: string
	role: Role
}

const UsersData: User[] = [
	{ id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'instructor' },
	{ id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'student' },
	{ id: 3, name: 'Carla Ruiz', email: 'carla@example.com', role: 'instructor' },
	{ id: 4, name: 'David Park', email: 'david@example.com', role: 'student' },
	{ id: 5, name: 'Emma Wong', email: 'emma@example.com', role: 'student' },
	{ id: 6, name: 'Frank Müller', email: 'frank@example.com', role: 'instructor' },
	{ id: 7, name: 'Gina Torres', email: 'gina@example.com', role: 'student' },
	{ id: 8, name: 'Hiro Tanaka', email: 'hiro@example.com', role: 'instructor' },
]

const roleLabel = (r: Role) => (r === 'instructor' ? 'Instructor' : 'Student')

const Users: React.FC = () => {
	const [filter, setFilter] = useState<'all' | Role>('all')
	const [query, setQuery] = useState('')

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		return UsersData.filter((u) => {
			if (filter !== 'all' && u.role !== filter) return false
			if (!q) return true
			return (u.name + u.email).toLowerCase().includes(q)
		})
	}, [filter, query])

	return (
		<main className='overflow-auto'>
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="mx-auto max-w-6xl">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-semibold text-gray-900">Users</h1>
							<p className="text-sm text-gray-500">Manage users and filter by role</p>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex rounded-md bg-white p-1 shadow-sm">
								<button
									onClick={() => setFilter('all')}
									className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
								>
									All
								</button>
								<button
									onClick={() => setFilter('instructor')}
									className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'instructor' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
								>
									Instructors
								</button>
								<button
									onClick={() => setFilter('student')}
									className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'student' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
								>
									Students
								</button>
							</div>

							<div className="flex items-center gap-2">
								<input
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search name or email..."
									className="w-60 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none"
								/>
								<button
									onClick={() => alert('Add user clicked')}
									className="ml-2 rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
								>
									Add user
								</button>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						{filtered.map((user) => (
							<div key={user.id} className="rounded-lg bg-white p-4 shadow hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
										{user.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<h3 className="text-sm font-medium text-gray-900 truncate">{user.name}</h3>
											<span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs hover:shadow-lg transition-shadow font-medium ${user.role === 'instructor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
												{roleLabel(user.role)}
											</span>
										</div>
										<p className="mt-1 text-sm text-gray-500 truncate">{user.email}</p>
									</div>
								</div>

								<div className="mt-3 flex items-center justify-between text-sm text-gray-500">
									<div className="flex gap-2">
										<button className="rounded-md bg-green-50 px-2 py-1 text-green-700 hover:shadow-lg transition-shadow bg-green-100">Activate Account</button>
										<button className="rounded-md bg-yellow-50 px-2 py-1 text-yellow-700 hover:shadow-lg transition-shadow bg-yellow-100">Deactivate Account</button>
										<button className="rounded-md bg-red-50 px-2 py-1 text-red-700 hover:shadow-lg transition-shadow bg-red-100">Ban from Comments</button>
										<button className="rounded-md bg-green-50 px-2 py-1 text-green-700 hover:shadow-lg transition-shadow bg-green-100">Unban from Comments</button>
										<button className="rounded-md bg-blue-50 px-2 py-1 text-blue-700 hover:shadow-lg transition-shadow bg-blue-100">Edit User</button>
										<button className="rounded-md bg-red-600 px-2 py-1 text-white hover:shadow-lg transition-shadow bg-red-700">Delete</button>
									</div>
								</div>
							</div>
						))}

						{filtered.length === 0 && (
							<div className="col-span-full rounded-lg bg-white p-6 text-center text-gray-500 shadow">
								Cannot find user.
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	)
}

export default Users