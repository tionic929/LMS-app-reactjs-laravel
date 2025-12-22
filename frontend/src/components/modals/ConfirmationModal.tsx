import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { approveInstructorApplication, getInstructorApplications, rejectInstructorApplication, type InstructorApplication } from "../../api/instructorApplications";

export type ConfirmPayload = {
    id: number;
    action: "approve" | "reject";
}

interface ConfirmationModalProps {
    setConfirm: (confirm: ConfirmPayload | null) => void;
    confirm: ConfirmPayload | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    setConfirm,
    confirm,
    onCancel,
    onSuccess,
    }) => {

    if(!confirm) return null;

    const executeAction = async () => {
        if (!confirm) return;
        try {
        await (confirm.action === "approve" ? approveInstructorApplication(confirm.id) : rejectInstructorApplication(confirm.id));
        toast.success("Record Updated");
        onSuccess();
        } finally { setConfirm(null); }
    };

    return (
        <>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 ">
          <div className="bg-white p-6 rounded-[40px] shadow-2xl max-w-xs w-full border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 tracking-tighter">Confirm Decision?</h3>
            <p className="text-slate-500 mt-2 text-sm font-medium leading-relaxed">This update will trigger an automatic notification to the instructor.</p>
            <div className="flex gap-3 mt-10">
              <button onClick={() => setConfirm(null)} className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={executeAction} className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-lg ${confirm && confirm.action === "approve" ? "bg-slate-900 shadow-slate-200" : "bg-rose-600 shadow-rose-100"}`}>Approve</button>
            </div>
          </div>
        </div>
        </>
    )
}

export default ConfirmationModal;