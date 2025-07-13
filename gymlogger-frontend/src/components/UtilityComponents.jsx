// src/components/UtilityComponents.jsx
import React from 'react';

export const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 max-w-sm mx-auto">
                <p className="text-lg text-white mb-4 text-center">{message}</p>
                <div className="flex justify-around space-x-4">
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out w-full"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={onCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out w-full"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export const InputField = ({ label, type = 'text', value, onChange, placeholder, min, step }) => (
    <div>
        <label className="block text-gray-300 text-sm font-bold mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            step={step}
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
        />
    </div>
);

export const MessageBox = ({ message, type }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`p-3 rounded-lg text-white text-center mt-4 ${bgColor}`}>
            {message}
        </div>
    );
};


export const getLast7DaysData = (data) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Set to the beginning of the day

    return data.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= sevenDaysAgo;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
};