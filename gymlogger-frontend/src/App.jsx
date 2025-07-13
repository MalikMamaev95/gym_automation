// src/App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
import { get } from 'aws-amplify/api';

// Import your components
import { AuthFormWrapper, InputField, SubmitButton, MessageBox, SignIn, SignUp, ConfirmSignUp, ForgotPassword } from './components/AuthComponents';
import { TabButton, DashboardCard, Dashboard, WeightliftingCategoryMenu } from './components/DashboardComponents';
import { WeightliftingForm, WeightForm, CardioForm } from './components/Forms';
import { HistoryView } from './components/HistoryViews';
import { ConfirmationModal, formatDate, getLast7DaysData } from './components/UtilityComponents';


// =======================================================
// Auth State Management and Components
// =======================================================

export const AuthContext = createContext(null); // Export AuthContext here

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading', 'signedIn', 'signedOut', 'confirmSignUp', 'forgotPassword'

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        // NEW: Add a null check for tokens before accessing accessToken
        if (tokens && tokens.accessToken) {
          const currentSession = await fetchAuthSession();
          const userId = currentSession.tokens.idToken.payload['custom:userId'] || currentSession.tokens.idToken.payload.sub;
          const username = currentSession.tokens.idToken.payload.email || currentSession.tokens.idToken.payload.username;

          setUser({
            attributes: {
              'custom:userId': userId,
              username: username,
              email: currentSession.tokens.idToken.payload.email
            }
          });
          setIsSignedIn(true);
          setAuthStatus('signedIn');
          console.log("User signed in:", username);

          // // DEBUGGING LOGS (REMOVE OR COMMENT OUT FOR PRODUCTION)
          // const session = await fetchAuthSession();
          // console.log("Amplify Session:", session);
          // if (session.credentials) {
          //   console.log("Amplify Credentials:", {
          //     accessKeyId: session.credentials.accessKeyId,
          //     secretAccessKey: session.credentials.secretAccessKey ? '***hidden***' : 'N/A',
          //     sessionToken: session.credentials.sessionToken ? '***hidden***' : 'N/A',
          //     identityId: session.credentials.identityId,
          //     authenticated: session.credentials.authenticated,
          //     expiration: session.credentials.expiration,
          //     sessionToken: session.credentials.sessionToken
          //   });
          //   console.log("Identity ID from credentials:", session.credentials.identityId);
          // } else {
          //   console.log("No credentials found in session.");
          // }


        } else {
          setIsSignedIn(false);
          setUser(null);
          setAuthStatus('signedOut');
        }
      } catch (error) {
        console.log("No user signed in (or error calling fetchAuthSession):", error);
        setIsSignedIn(false);
        setUser(null);
        setAuthStatus('signedOut');
      }
    };
    checkUser();

    const unsubscribeAuth = Hub.listen('auth', (data) => {
      const { payload } = data;
      console.log('Auth event:', payload.event);
      switch (payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
          setIsSignedIn(false);
          setAuthStatus('signedOut');
          break;
        case 'signedUp':
          break;
        case 'autoSignIn':
        case 'autoSignIn_failure':
        case 'tokenRefresh':
        case 'tokenRefresh_failure':
          checkUser();
          break;
        default:
          break;
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const value = { isSignedIn, user, authStatus, setAuthStatus, setIsSignedIn, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =======================================================
// Main App Component
// =======================================================
const App = () => {
  const { isSignedIn, user, authStatus, setAuthStatus } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weightliftingCategory, setWeightliftingCategory] = useState(null);

  const [weightliftingData, setWeightliftingData] = useState([]);
  const [bodyWeightData, setBodyWeightData] = useState([]);
  const [cardioData, setCardioData] = useState([]);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setWeightliftingData([]);
      setBodyWeightData([]);
      setCardioData([]);
      return;
    }

    const fetchAllData = async () => {
      try {
        console.log('App useEffect: Attempting to fetch all data.');
        const userId = user.attributes['custom:userId'] || user.attributes.sub || user.username;

        // Fetch weightlifting data
        const wlRestOperation = get({
          apiName: 'GymLoggerApi',
          path: `/entries/${userId}`,
          options: {
            queryParams: { type: 'weightlifting' }
          }
        });
        const { body: wlBody } = await wlRestOperation.response;
        const wlData = await wlBody.json();
        setWeightliftingData(wlData);

        // Fetch body weight data
        const bwRestOperation = get({
          apiName: 'GymLoggerApi',
          path: `/entries/${userId}`,
          options: {
            queryParams: { type: 'body_weight' }
          }
        });
        const { body: bwBody } = await bwRestOperation.response;
        const bwData = await bwBody.json();
        setBodyWeightData(bwData);

        // Fetch cardio data
        const cRestOperation = get({
          apiName: 'GymLoggerApi',
          path: `/entries/${userId}`,
          options: {
            queryParams: { type: 'cardio' }
          }
        });
        const { body: cBody } = await cRestOperation.response;
        const cData = await cBody.json();
        setCardioData(cData);

        console.log("Fetched all data from API.");
      } catch (error) {
        console.error("Error fetching all data:", error);
      }
    };
    fetchAllData();
  }, [isSignedIn, user]);

  const handleSignOut = async () => {
    try {
      console.log('App: Attempting signOut...');
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading application...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center p-4">
        {authStatus === 'signedOut' && <SignIn setAuthStatus={setAuthStatus} />}
        {authStatus === 'signUp' && <SignUp setAuthStatus={setAuthStatus} />}
        {authStatus === 'confirmSignUp' && <ConfirmSignUp setAuthStatus={setAuthStatus} />}
        {authStatus === 'forgotPassword' && <ForgotPassword setAuthStatus={setAuthStatus} />}
      </div>
    );
  }

  return (
    // Outer div: Ensures full screen background, content pushed to top
<div
  className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white font-inter p-4 sm:p-8 flex flex-col items-center justify-start"
>
  <div
    style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}
    className="flex flex-col items-center justify-start"
  >
    <div className="rounded-xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white font-inter p-4 sm:p-8 flex flex-col items-center justify-start">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-10 mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col self-start">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-2">
          <h1 className="text-5xl sm:text-5xl font-medium text-center sm:text-left font-['Lexend_Deca'] flex-grow">
            <span className="text-cyan-400">Gym</span><span className="text-red-500">Logger</span>
          </h1>
        </div>

        <div className="flex justify-center mb-6 space-x-2 sm:space-x-4 flex-wrap"> {/* Dashboard/History Tabs */}
        <TabButton
          label="Dashboard"
          isActive={activeTab === 'dashboard'}
          color="cyan"
          onClick={() => {
            setActiveTab('dashboard');
            setWeightliftingCategory(null);
          }}
          />
          <TabButton
            label="View History"
            isActive={activeTab === 'allHistory'}
            color="red"
            onClick={() => { setActiveTab('allHistory'); }}
          />
        </div>

        {/* Content area for Dashboard/Forms/History - REMOVED flex-grow here */}
        <div className="menu-box max-h-[70vh] overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              setActiveTab={setActiveTab}
              setWeightliftingCategory={setWeightliftingCategory}
            />
          )}
          {activeTab === 'weightliftingForm' && !weightliftingCategory && (
            <WeightliftingCategoryMenu
              onSelectCategory={(cat) => setWeightliftingCategory(cat)}
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'weightliftingForm' && weightliftingCategory && (
            <WeightliftingForm
              userId={user.attributes['custom:userId'] || user.username}
              data={weightliftingData}
              setData={setWeightliftingData}
              setActiveTab={setActiveTab}
              category={weightliftingCategory}
              onBackCategory={() => setWeightliftingCategory(null)}
            />
          )}
          {activeTab === 'weightForm' && (
            <WeightForm
              userId={user.attributes['custom:userId'] || user.username}
              data={bodyWeightData}
              setData={setBodyWeightData}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'cardioForm' && (
            <CardioForm
              userId={user.attributes['custom:userId'] || user.username}
              data={cardioData}
              setData={setCardioData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'weightliftingFullHistory' && (
            <WeightliftingFullHistoryView
              data={weightliftingData}
              setData={setWeightliftingData}
              userId={user.attributes['custom:userId'] || user.username}
            />
          )}
          {activeTab === 'weightFullHistory' && (
            <WeightFullHistoryView
              data={bodyWeightData}
              setData={setBodyWeightData}
              userId={user.attributes['custom:userId'] || user.username}
            />
          )}
          {activeTab === 'cardioFullHistory' && (
            <CardioFullHistoryView
              data={cardioData}
              setData={setCardioData}
              userId={user.attributes['custom:userId'] || user.username}
            />
          )}

          {activeTab === 'allHistory' && (
            <HistoryView
              weightliftingData={weightliftingData}
              bodyWeightData={bodyWeightData}
              cardioData={cardioData}
              setWeightliftingData={setWeightliftingData}
              setBodyWeightData={setBodyWeightData}
              setCardioData={setCardioData}
              userId={user.attributes['custom:userId'] || user.username}
            />
          )}
        </div>
      </div>

      {/* Sign Out button */}
      <button
        onClick={handleSignOut}
        className="mt-3 px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-m font-semibold transition-colors duration-200 shadow-xl"
      >
        Sign Out
      </button>
    </div>
    </div>
    </div>
  );
};

export default App;