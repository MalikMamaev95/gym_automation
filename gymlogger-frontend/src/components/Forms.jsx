// src/components/Forms.jsx
import React, { useState } from 'react';
import { post, del } from 'aws-amplify/api'; // Import post and del from Amplify API
import { InputField, MessageBox, ConfirmationModal } from './UtilityComponents'; // Re-exporting from UtilityComponents
import { getLast7DaysData, formatDate } from './UtilityComponents';

// Weightlifting Form Component
export const WeightliftingForm = ({ userId, data, setData, category, onBackCategory }) => {
  const exercisesByCategory = {
    "Push": ["Flat Smith Press", "Flat Bench Press", "Machine Chest Press", "Chest Fly", "Shoulder Press", "Tricep Pulldown", "Overhead Tricep Extension"],
    "Pull": ["Lat Pulldown", "Pull-ups", "Iso Lat Low Row", "Row", "Row (Single Arm)", "Rear Delt Fly", "Bicep Curl", "Bicep Curl (Cable)", "Hammer Curl"],
    "Legs": ["Squat", "Leg Press", "Leg Extension", "Deadlift"],
    "Full Body": ["Trap Bar Deadlift", "Clean & Press", "Plyo Push-up", "Landmine Rotation", "Pull-ups"],
  };
  const exerciseList = exercisesByCategory[category] || [];

  const [inputs, setInputs] = useState(() =>
    exerciseList.reduce((acc, exercise) => {
      acc[exercise] = { weight: "", reps: "", sets: "" };
      return acc;
    }, {})
  );
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const handleInputChange = (exercise, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [exercise]: { ...prev[exercise], [field]: value },
    }));
  };

const handleLog = async () => {
  setMessage("");
  setMessageType("");
  setIsSubmitting(true);

  const today = new Date().toISOString().slice(0, 10);

  // Build a list of exercises that have all fields filled
  const exercisesToLog = Object.entries(inputs)
    .filter(([exercise, { weight, reps, sets }]) => weight && reps && sets)
    .map(([exercise, { weight, reps, sets }]) => ({
      type: "weightlifting",
      date: today,
      exercise,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight),
      timestamp: new Date().toISOString(),
      category: category,
    }));

  if (exercisesToLog.length === 0) {
    setMessage("Please fill in all fields for at least one exercise.");
    setMessageType("error");
    setIsSubmitting(false);
    return;
  }

  try {
    for (const dataToSave of exercisesToLog) {
      const apiPath = `/entries/${userId}`;
      console.log(`WeightliftingForm: Logging ${dataToSave.exercise}…`);
      const restOperation = post({
        apiName: 'GymLoggerApi',
        path: apiPath,
        options: {
          body: dataToSave
        }
      });
      const { body: responseBody } = await restOperation.response;
      const response = await responseBody.json();
      console.log('API Response (POST):', response);

      setData((prevData) => [
        { ...dataToSave, id: response.id },
        ...prevData,
      ]);

      // Clear that exercise's inputs
      setInputs((prev) => ({
        ...prev,
        [dataToSave.exercise]: { weight: "", reps: "", sets: "" },
      }));
    }

    setMessage(`Logged ${exercisesToLog.length} exercise(s)!`);
    setMessageType("success");
  } catch (error) {
    console.error("Error logging weightlifting data:", error);
    setMessage(`Error logging data: ${error.message || error.response?.data?.error || 'Unknown error'}`);
    setMessageType("error");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDelete) return;

    try {
      const apiPath = `/entries/${userId}/${itemToDelete.id}`;
      console.log('WeightliftingForm: Attempting del...');
      // Use the modern Amplify API.del syntax
      const restOperation = del({
        apiName: 'GymLoggerApi',
        path: apiPath,
      });
      await restOperation.response; // No need to parse body for DELETE
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

  const last7DaysData = getLast7DaysData(data).filter(
    (item) => !category || item.category === category
  );

  return (
  <div className="space-y-1 flex flex-col gap-0">
  <div className="flex items-center justify-center mb-0 w-full relative">
    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 text-center">
      {category}
    </h2>
  </div>

  <div className="overflow-x-auto rounded-lg shadow-md">
    <table className="min-w-full bg-gray-800">
      <thead className="bg-gray-900">
        <tr>
          <th className="py-3 px-2 sm:px-4 text-center text-gray-300 text-sm sm:text-base whitespace-nowrap min-w-[120px]">
            Exercise
          </th>
          <th className="py-3 px-2 sm:px-4 text-center text-gray-300 text-sm sm:text-base">
            Weight
          </th>
          <th className="py-3 px-2 sm:px-4 text-center text-gray-300 text-sm sm:text-base">
            Reps
          </th>
          <th className="py-3 px-2 sm:px-4 text-center text-gray-300 text-sm sm:text-base">
            Sets
          </th>
        </tr>
      </thead>

      <tbody>
        {exerciseList.map((exercise) => (
          <tr key={exercise} className="border-b border-gray-600 last:border-b-0">
            <td className="py-2 px-4 sm:px-4 text-center text-sm sm:text-base whitespace-nowrap min-w-[120px]">
              {exercise}
            </td>
            <td className="py-2 px-1 sm:px-4 text-center">
              <input
                type="number"
                min="0"
                step="5"
                className="w-10 sm:w-24 px-2 py-1 rounded bg-gray-700 text-white text-sm sm:text-base"
                value={inputs[exercise].weight || ""}
                onChange={(e) => handleInputChange(exercise, "weight", e.target.value)}
              />
            </td>
            <td className="py-2 px-2 sm:px-4 text-center">
              <input
                type="number"
                min="1"
                className="w-10 sm:w-16 px-2 py-1 rounded bg-gray-700 text-white text-sm sm:text-base"
                value={inputs[exercise].reps || ""}
                onChange={(e) => handleInputChange(exercise, "reps", e.target.value)}
              />
            </td>
            <td className="py-2 px-2 sm:px-4 text-center">
              <input
                type="number"
                min="1"
                className="w-10 sm:w-16 px-2 py-1 rounded bg-gray-700 text-white text-sm sm:text-base"
                value={inputs[exercise].sets || ""}
                onChange={(e) => handleInputChange(exercise, "sets", e.target.value)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="flex justify-center mt-4">
    <button
      className="my-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-1 px-4 rounded-lg focus:outline-none focus:shadow-outline transform transition-all duration-300 ease-in-out hover:scale-105 shadow-lg text-m sm:text-base"
      onClick={handleLog} // Update your handler to process all rows
      disabled={isSubmitting}
    >
      Log
    </button>
  </div>

  <MessageBox message={message} type={messageType} />

      <div className="mt-10 pt-6 border-t border-gray-600 flex flex-col items-center">
        <h3 className="text-xl sm:text-2xl font-bold text-red-500 mb-4 text-center">Last 7 Days Weightlifting</h3> {/* Responsive text size */}
        {last7DaysData.length > 0 ? (
          <div className="overflow-x-auto w-full rounded-lg shadow-md"> {/* Added rounded-lg and shadow-md here */}
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
                {last7DaysData.map((item) => (
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
        ) : (
          <p className="text-center text-gray-400">No weightlifting data for the last 7 days.</p>
        )}
      </div>
      <ConfirmationModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this entry?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

// Weight Form Component
export const WeightForm = ({ userId, data, setData }) => {
  const [weight, setWeight] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);

    if (!weight) {
      setMessage('Please enter your weight.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    const dataToSave = {
      type: 'body_weight',
      date: today,
      weight: parseFloat(weight),
      timestamp: new Date().toISOString(),
    };

    try {
      const apiPath = `/entries/${userId}`;
      console.log('WeightForm: Attempting post...');
      const restOperation = post({
        apiName: 'GymLoggerApi',
        path: apiPath,
        options: {
          body: dataToSave
        }
      });
      const { body: responseBody } = await restOperation.response;
      const response = await responseBody.json();
      console.log('API Response (POST):', response);

      setData(prevData => [{ ...dataToSave, id: response.id }, ...prevData]);
      setMessage('Body weight logged!');
      setMessageType('success');
      setWeight('');
    } catch (error) {
      console.error("Error logging body weight data:", error);
      setMessage(`Error logging data: ${error.message || error.response?.data?.error || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDelete) return;

    try {
      const apiPath = `/entries/${userId}/${itemToDelete.id}`;
      console.log('WeightForm: Attempting del...');
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

    const last7DaysData = getLast7DaysData(data);

    return (
      <div className="space-y-4 flex flex-col items-center -mt-5">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 w-full max-w-xs sm:max-w-sm mx-auto bg-gray-900 rounded-lg shadow-lg p-4" /* Responsive width */
        >
          <h2 className="text-2xl font-bold text-center text-red-500 mb-4">
            Body Weight
          </h2>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2 text-center">
              Weight (KG)
            </label>
            <div className="flex justify-center">
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              min="0"
              className="shadow appearance-none border rounded-lg w-24 sm:w-32 py-2 px-3 bg-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500 transition-all duration-200 text-sm sm:text-base" /* Responsive width */
              required
            />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-30 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transform transition-all duration-300 ease-in-out hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Add Weight'}
            </button>
            </div>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-600 w-full max-w-xs sm:max-w-sm"> {/* Responsive width */}
          <h3 className="text-xl font-bold text-red-500 mb-3 text-center">Last 7 Days Body Weight</h3>
          {last7DaysData.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow-md"> {/* Added rounded-lg and shadow-md here */}
              <table className="w-full bg-gray-800"> {/* Removed rounded-lg and overflow-hidden from table */}
                <thead className="bg-gray-900">
                  <tr>
                    <th className="py-1 px-2 text-center text-gray-300 text-xs sm:text-sm">Date</th> {/* Responsive text size */}
                    <th className="py-1 px-2 text-center text-gray-300 text-xs sm:text-sm">Weight</th> {/* Responsive text size */}
                    <th className="py-1 px-2 text-center text-gray-300 text-xs sm:text-sm">Actions</th> {/* Responsive text size */}
                  </tr>
                </thead>
                <tbody>
                  {last7DaysData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors duration-150">
                      <td className="py-1 px-2 text-center text-xs sm:text-sm">{formatDate(item.date)}</td> {/* Responsive text size */}
                      <td className="py-1 px-2 text-center text-xs sm:text-sm">{item.weight}</td> {/* Responsive text size */}
                      <td className="py-1 px-2 flex justify-center items-center">
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs transition-colors duration-200" /* Responsive text size */
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400">No body weight data for the last 7 days.</p>
          )}
        </div>
        <ConfirmationModal
          isOpen={showConfirmModal}
          message="Are you sure you want to delete this entry?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </div>
    );
  };

  export const CardioForm = ({ userId, data, setData }) => {
    const [activeSection, setActiveSection] = useState('running');
    const [runTime, setRunTime] = useState('');
    const [runDistance, setRunDistance] = useState('');
    const [sprintInterval, setSprintInterval] = useState('');
    const [sprintPower, setSprintPower] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const today = new Date().toISOString().slice(0, 10);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage('');
      setMessageType('');
      setIsSubmitting(true);

      let dataToSave = null;
      let isValid = true;

      if (activeSection === 'running') {
        if (!runTime || !runDistance) {
          setMessage('Please enter both time and distance for running.');
          setMessageType('error');
          isValid = false;
        }
        dataToSave = {
          type: 'cardio',
          subtype: 'running',
          date: today,
          time: parseFloat(runTime),
          distance: parseFloat(runDistance),
          timestamp: new Date().toISOString(),
        };
      } else {
        if (!sprintInterval || !sprintPower) {
          setMessage('Please enter both interval and power for sprints.');
          setMessageType('error');
          isValid = false;
        }
        dataToSave = {
          type: 'cardio',
          subtype: 'sprints',
          date: today,
          interval: sprintInterval, // Changed to string
          power: parseFloat(sprintPower),
          timestamp: new Date().toISOString(),
        };
      }

      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      try {
        const apiPath = `/entries/${userId}`;
        console.log('CardioForm: Attempting post...');
        const restOperation = post({
          apiName: 'GymLoggerApi',
          path: apiPath,
          options: {
            body: dataToSave
          }
        });
        const { body: responseBody } = await restOperation.response;
        const response = await responseBody.json();
        console.log('API Response (POST):', response);

        setData(prevData => [{ ...dataToSave, id: response.id }, ...prevData]);
        setMessage('Cardio logged!');
        setMessageType('success');

        setRunTime('');
        setRunDistance('');
        setSprintInterval('');
        setSprintPower('');
      } catch (error) {
        console.error("Error logging cardio data:", error);
        setMessage(`Error logging data: ${error.message || error.response?.data?.error || 'Unknown error'}`);
        setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDelete) return;

    try {
      const apiPath = `/entries/${userId}/${itemToDelete.id}`;
      console.log('CardioForm: Attempting del...');
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

  const last7DaysData = getLast7DaysData(data);

  return (
    <div className="space-y-4">
      <div className="relative mb-4 w-full flex justify-center">
        <h2 className="text-2xl font-bold text-center text-red-500 mb-2">
          Cardio
        </h2>
        <div className="absolute right-0 w-12 sm:w-24" />
      </div>

      <div className="flex justify-center space-x-2 sm:space-x-4 mb-2 flex-wrap"> {/* Added flex-wrap for mobile */}
        <button
          type="button"
          className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 text-sm sm:text-base ${activeSection === 'running' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-200'}`} /* Responsive padding/text size */
          onClick={() => setActiveSection('running')}
        >
          Running
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 text-sm sm:text-base ${activeSection === 'sprints' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-200'}`} /* Responsive padding/text size */
          onClick={() => setActiveSection('sprints')}
        >
          Sprints
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-xs sm:max-w-sm mx-auto bg-gray-900 rounded-lg shadow-lg p-4"> {/* Responsive width */}
        {activeSection === 'running' ? (
          <>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2 text-center">Time (minutes)</label>
              <div className="flex justify-center">
              <input
                type="number"
                min="0"
                step="1"
                value={runTime}
                onChange={e => setRunTime(e.target.value)}
                className="shadow appearance-none border rounded-lg w-24 sm:w-32 py-2 px-3 bg-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500 transition-all duration-200 text-sm sm:text-base" /* Responsive width */
                required
              />
            </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2 text-center">Distance (km)</label>
              <div className="flex justify-center">
              <input
                type="number"
                min="0"
                step="0.01"
                value={runDistance}
                onChange={e => setRunDistance(e.target.value)}
                className="shadow appearance-none border rounded-lg w-24 sm:w-32 py-2 px-3 bg-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500 transition-all duration-200 text-sm sm:text-base" /* Responsive width */
                required
              />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2 text-center">Active/Rest (e.g., "30s/30s")</label>
              <div className="flex justify-center">
              <input
                type="text" // Changed to text
                value={sprintInterval}
                onChange={e => setSprintInterval(e.target.value)}
                className="shadow appearance-none border rounded-lg w-24 sm:w-32 py-2 px-3 bg-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500 transition-all duration-200 text-sm sm:text-base" /* Responsive width */
                required
              />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2 text-center">Power (watts)</label>
              <div className="flex justify-center">
              <input
                type="number"
                min="0"
                step="1"
                value={sprintPower}
                onChange={e => setSprintPower(e.target.value)}
                className="shadow appearance-none border rounded-lg w-24 sm:w-32 py-2 px-3 bg-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500 transition-all duration-200 text-sm sm:text-base" /* Responsive width */
                required
              />
              </div>
            </div>
          </>
        )}
        <div className="flex justify-center">
        <button
          type="submit"
          className="w-18 h-8 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transform transition-all duration-300 ease-in-out hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base" /* Responsive text size */
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Add Entry'}
        </button>
        </div>
        <MessageBox message={message} type={messageType} />
      </form>

      <div className="mt-10 pt-6 border-t border-gray-600 w-full max-w-xs sm:max-w-sm"> {/* Responsive width */}
        <h3 className="text-xl font-bold text-red-500 mb-4 text-center">Last 7 Days Cardio</h3>
        {last7DaysData.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-md"> {/* Added rounded-lg and shadow-md here */}
            <table className="w-full bg-gray-800"> {/* Removed rounded-lg and overflow-hidden from table */}
              <thead className="bg-gray-900">
                <tr>
                  <th className="py-1 px-2 text-left text-gray-300 text-xs sm:text-sm">Date</th> {/* Responsive text size */}
                  <th className="py-1 px-2 text-left text-gray-300 text-xs sm:text-sm">Type</th> {/* Responsive text size */}
                  <th className="py-1 px-2 text-left text-gray-300 text-xs sm:text-sm">Details</th> {/* Responsive text size */}
                  <th className="py-1 px-2 text-left text-gray-300 text-xs sm:text-sm">Actions</th> {/* Responsive text size */}
                </tr>
              </thead>
              <tbody>
                {last7DaysData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors duration-150">
                    <td className="py-1 px-2 text-xs sm:text-sm">{formatDate(item.date)}</td> {/* Responsive text size */}
                    <td className="py-1 px-2 capitalize text-xs sm:text-sm">{item.subtype || ''}</td> {/* Responsive text size */}
                    <td className="py-1 px-2 text-xs sm:text-sm">
                      {item.subtype === 'running' && (
                        <>{item.time} min, {item.distance} km</>
                      )}
                      {item.subtype === 'sprints' && (
                        <>Active/Rest: {item.interval}, Power: {item.power} W</>
                      )}
                    </td>
                    <td className="py-1 px-2 flex justify-center items-center">
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs transition-colors duration-200" /* Responsive text size */
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-400">No cardio data for the last 7 days.</p>
        )}
        <ConfirmationModal
          isOpen={showConfirmModal}
          message="Are you sure you want to delete this entry?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </div>
    </div>
  );
};