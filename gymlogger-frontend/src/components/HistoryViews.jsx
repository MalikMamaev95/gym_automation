// src/components/HistoryViews.jsx
import React, { useState } from 'react';
import { del } from 'aws-amplify/api'; // Import del from Amplify API
import { ConfirmationModal, MessageBox, formatDate } from './UtilityComponents'; // Re-exporting from UtilityComponents
import { TabButton } from './DashboardComponents'; // Assuming TabButton is also used here

export const WeightliftingFullHistoryView = ({ data, setData, userId }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDelete) return;

    try {
      const apiPath = `/entries/${userId}/${itemToDelete.id}`;
      console.log('WeightliftingFullHistoryView: Attempting del...');
      const restOperation = del({
        apiName: 'GymLoggerApi',
        path: apiPath,
      });
      await restOperation.response;
      console.log('API Response (DELETE): Item deleted');

      setData(prevData => prevData.filter(item => item.id !== itemToDelete.id));
      setMessage('Weightlifting entry deleted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error("Error deleting weightlifting data:", error);
      setMessage(`Error deleting data: ${error.message || error.response?.data?.error || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-red-500 mb-6">Weightlifting History</h2>
      <MessageBox message={message} type={messageType} />

      {data.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">No weightlifting data available.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md"> {/* Added rounded-lg and shadow-md here */}
          <table className="min-w-full bg-gray-800"> {/* Removed rounded-lg and overflow-hidden from table */}
            <thead className="bg-gray-900">
              <tr>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Date</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Exercise</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Sets</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Reps</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Weight</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors duration-150">
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{formatDate(item.date)}</td>
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{item.exercise}</td>
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{item.sets}</td>
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{item.reps}</td>
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{item.weight}</td>
                  <td className="py-2 px-2 sm:px-4 flex justify-center items-center">
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs sm:text-sm transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this entry?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export const WeightFullHistoryView = ({ data, setData, userId }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDelete) return;

    try {
      const apiPath = `/entries/${userId}/${itemToDelete.id}`;
      console.log('WeightFullHistoryView: Attempting del...');
      const restOperation = del({
        apiName: 'GymLoggerApi',
        path: apiPath,
      });
      await restOperation.response;
      console.log('API Response (DELETE): Item deleted');

      setData(prevData => prevData.filter(item => item.id !== itemToDelete.id));
      setMessage('Body weight entry deleted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error("Error deleting body weight data:", error);
      setMessage(`Error deleting data: ${error.message || error.response?.data?.error || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-red-500 mb-6">Body Weight History</h2>
      <MessageBox message={message} type={messageType} />

      {data.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">No body weight data available.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md"> {/* Added rounded-lg and shadow-md here */}
          <table className="min-w-full bg-gray-800"> {/* Removed rounded-lg and overflow-hidden from table */}
            <thead className="bg-gray-900">
              <tr>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Date</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Weight</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors duration-150">
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{formatDate(item.date)}</td>
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{item.weight}</td>
                  <td className="py-2 px-2 sm:px-4 flex justify-center items-center">
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs sm:text-sm transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this entry?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export const CardioFullHistoryView = ({ data, setData, userId }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDelete) return;

    try {
      const apiPath = `/entries/${userId}/${itemToDelete.id}`;
      console.log('CardioFullHistoryView: Attempting del...');
      const restOperation = del({
        apiName: 'GymLoggerApi',
        path: apiPath,
      });
      await restOperation.response;
      console.log('API Response (DELETE): Item deleted');

      setData(prevData => prevData.filter(item => item.id !== itemToDelete.id));
      setMessage('Cardio entry deleted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error("Error deleting cardio data:", error);
      setMessage(`Error deleting data: ${error.message || error.response?.data?.error || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-red-500 mb-6">Cardio History</h2>
      <MessageBox message={message} type={messageType} />

      {data.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">No cardio data available.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md"> {/* Added rounded-lg and shadow-md here */}
          <table className="min-w-full bg-gray-800"> {/* Removed rounded-lg and overflow-hidden from table */}
            <thead className="bg-gray-900">
              <tr>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Date</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Type</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Details</th>
                <th className="py-3 px-2 sm:px-4 text-left text-gray-300 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors duration-150">
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{formatDate(item.date)}</td>
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base capitalize">{item.subtype || ''}</td>
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">
                    {item.subtype === 'running' && (
                      <>Time: {item.time} min, Distance: {item.distance} km</>
                    )}
                    {item.subtype === 'sprints' && (
                      <>Active/Rest: {item.interval}, Power: {item.power} W</>
                    )}
                  </td>
                  <td className="py-2 px-2 sm:px-4 flex justify-center items-center">
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs sm:text-sm transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this entry?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export const HistoryView = ({ weightliftingData, bodyWeightData, cardioData, setWeightliftingData, setBodyWeightData, setCardioData, userId }) => {
  const [activeHistoryTab, setActiveHistoryTab] = useState('weightlifting');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDelete) {
      setMessage('Error: Item to delete not found.');
      setMessageType('error');
      return;
    }

    try {
      const apiPath = `/entries/${userId}/${itemToDelete.id}`;
      console.log('HistoryView: Attempting del...');
      const restOperation = del({
        apiName: 'GymLoggerApi',
        path: apiPath,
      });
      await restOperation.response;
      console.log('API Response (DELETE): Item deleted');

      if (itemToDelete.type === 'weightlifting') {
        setWeightliftingData(prevData => prevData.filter(item => item.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'body_weight') {
        setBodyWeightData(prevData => prevData.filter(item => item.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'cardio') {
        setCardioData(prevData => prevData.filter(item => item.id !== itemToDelete.id));
      }
      setMessage(`${itemToDelete.type} entry deleted successfully!`);
      setMessageType('success');
    } catch (error) {
      console.error("Error deleting data:", error);
      setMessage(`Error deleting data: ${error.message || error.response?.data?.error || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  const allData = [
    ...weightliftingData,
    ...bodyWeightData,
    ...cardioData
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filteredData = activeHistoryTab === 'all'
    ? allData
    : activeHistoryTab === 'weightlifting'
      ? weightliftingData
      : activeHistoryTab === 'weight'
        ? bodyWeightData
        : cardioData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-center mb-6 space-y-2 sm:space-y-4">
        <TabButton
          label="Weightlifting"
          isActive={activeHistoryTab === 'weightlifting'}
          onClick={() => setActiveHistoryTab('weightlifting')}
        />
        <TabButton
          label="Body Weight"
          isActive={activeHistoryTab === 'weight'}
          onClick={() => setActiveHistoryTab('weight')}
        />
        <TabButton
          label="Cardio"
          isActive={activeHistoryTab === 'cardio'}
          onClick={() => setActiveHistoryTab('cardio')}
        />
      </div>

      <MessageBox message={message} type={messageType} />

      {filteredData.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">No data available for this category.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md"> {/* Added rounded-lg and shadow-md here */}
          <table className="min-w-full bg-gray-800"> {/* Removed rounded-lg and overflow-hidden from table */}
            <thead className="bg-gray-900">
              <tr>
                <th className="py-3 px-2 sm:px-4 text-center text-gray-300 text-sm sm:text-base">Date</th>
                {activeHistoryTab !== 'weight' && (
                  <th className="py-3 px-2 sm:px-4 text-center text-gray-300 text-sm sm:text-base">Type</th>
                )}
                <th className="py-3 px-2 sm:px-4 text-center text-gray-300 text-sm sm:text-base">Details</th>
                <th className="py-3 px-2 sm:px-4 text-center text-gray-300 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors duration-150">
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{formatDate(item.date)}</td>
                  {item.type === 'weightlifting' && (
                    <td className="py-2 px-2 sm:px-4 text-sm sm:text-base capitalize">{item.category}</td>
                  )}
                  {item.type === 'body_weight' && (
                    <td className="py-2 px-2 sm:px-4 text-sm sm:text-base capitalize">Body Weight</td>
                  )}
                  {item.type === 'cardio' && (
                    <td className="py-2 px-2 sm:px-4 text-sm sm:text-base capitalize">{item.subtype}</td>
                  )}
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">
                    {item.type === 'weightlifting' &&
                      `${item.exercise} - ${item.sets}x${item.reps} - ${item.weight} KG`
                    }
                    {item.type === 'body_weight' &&
                      `${item.weight} KG`
                    }
                    {item.type === 'cardio' && (
                      item.subtype === 'running'
                        ? `${item.time} min, ${item.distance} km`
                        : `Active/Rest: ${item.interval}, Power: ${item.power} W`
                    )}
                  </td>
                  <td className="py-2 px-2 sm:px-4 flex justify-center items-center">
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs sm:text-sm transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this entry?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};