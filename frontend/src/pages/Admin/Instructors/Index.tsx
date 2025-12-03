import React, { useEffect, useState, useCallback } from "react";
import { FaUserTie, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
    getInstructorApplications,
    approveInstructorApplication,
    rejectInstructorApplication,
    type InstructorApplication
} from "../../../api/instructorApplications";
import ViewUserModal from "../../../components/modals/ViewUserModal";
// NOTE: You will need a custom modal component (e.g., ConfirmationModal, AlertToast) 
// to replace the forbidden 'window.confirm' and 'alert()' functions.

const InstructorApplications: React.FC = () => {
    const [applications, setApplications] = useState<InstructorApplication[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewUser, setViewUser] = useState<InstructorApplication | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getInstructorApplications("pending"); // only pending
            // Ensure data is an array before setting state
            setApplications(Array.isArray(data) ? data : []); 
        } catch (err) {
            console.error("Failed to fetch applications:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleApprove = async (id: number) => {
        // TODO: Replace with custom Confirmation Modal UI
        if (!window.confirm("Approve this instructor application?")) return; 
        
        try {
            await approveInstructorApplication(id);
            fetchApplications();
        } catch (err) {
            // TODO: Replace with custom Notification/Toast UI
            console.error("Error approving application:", err); 
            // alert("Error approving application.");
        }
    };

    const handleReject = async (id: number) => {
        // TODO: Replace with custom Confirmation Modal UI
        if (!window.confirm("Reject this instructor application?")) return;
        
        try {
            await rejectInstructorApplication(id);
            fetchApplications();
        } catch (err) {
            // TODO: Replace with custom Notification/Toast UI
            console.error("Error rejecting application:", err);
            // alert("Error rejecting application.");
        }
    };

    const openView = (app: InstructorApplication) => {
        setViewUser(app);
        setModalOpen(true);
    };

    return (
        <main className="h-full overflow-y-auto bg-gray-50">
            <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* Page Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FaUserTie className="text-indigo-600" />
                        Instructor Applications
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage and approve pending instructor registrations.
                    </p>
                </header>

                {/* Content Block */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Pending Applications</h2>

                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Loading...</div>
                    ) : applications.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                            No pending instructor applications.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {applications.map((app) => (
                                <div
                                    key={app.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 border rounded-xl shadow-sm hover:bg-gray-100 transition"
                                >
                                    {/* Left: Applicant Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center">
                                            {/* FIX: Add null/undefined check for app.name */}
                                            {(app.user?.name || app.name || "N/A")
                                                .split(" ")
                                                .map((n: string) => n[0])
                                                .join("")
                                            }
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{app.user.name || 'Unknown Applicant'}</h3>
                                            <p className="text-xs text-gray-500">{app.user.email || 'N/A'}</p>
                                            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-semibold">Pending Review</span>
                                        </div>
                                    </div>

                                    {/* Right: Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openView(app)}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-white border hover:bg-gray-100 text-indigo-600 font-semibold"
                                        >
                                            View Details
                                        </button>

                                        <button
                                            onClick={() => handleApprove(app.id)}
                                            className="flex items-center px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700"
                                        >
                                            <FaCheckCircle className="mr-1" />
                                            Approve
                                        </button>

                                        <button
                                            onClick={() => handleReject(app.id)}
                                            className="flex items-center px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
                                        >
                                            <FaTimesCircle className="mr-1" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* View Modal */}
                <ViewUserModal
                    show={modalOpen}
                    user={viewUser?.user ?? null}
                    onClose={() => {
                        setModalOpen(false);
                        setViewUser(null);
                    }}
                    onSuccess={() => fetchApplications()}
                />
            </div>
        </main>
    );
};

export default InstructorApplications;