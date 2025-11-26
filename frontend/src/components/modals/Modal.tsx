import React from "react";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ show, onClose, children, title }: ModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 w-full max-w-md rounded-lg shadow-lg relative">
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 px-2 py-1 rounded"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
