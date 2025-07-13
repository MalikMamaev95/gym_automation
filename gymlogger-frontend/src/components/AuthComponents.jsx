// src/components/AuthComponents.jsx
import React, { useState } from 'react';
// Import only core Amplify Auth functions
import { signIn, signUp, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword } from 'aws-amplify/auth';

// Reusable Authentication Form Wrapper
export const AuthFormWrapper = ({ title, children }) => (
  // Added max-w-md and mx-auto for centering and width control
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 sm:p-10 rounded-2xl shadow-3xl max-w-md mx-auto w-full border border-gray-700/50 transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
    <h2 className="text-4xl font-extrabold text-center text-cyan-400 mb-8 tracking-wide font-['Lexend_Deca'] drop-shadow-lg">
      {title}
    </h2>
    {children}
  </div>
);

// Reusable Input Field Component
export const InputField = ({ label, type, value, onChange, placeholder, step, min, max, required = true }) => (
  <div className="mb-5">
    <label className="block text-gray-300 text-sm font-semibold mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      className="shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-400 transition-all duration-200 text-lg"
      required={required}
    />
  </div>
);

// Reusable Submit Button Component
export const SubmitButton = ({ label, isSubmitting }) => (
  <button
    type="submit"
    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transform transition-all duration-300 ease-in-out hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide"
    disabled={isSubmitting}
  >
    {isSubmitting ? 'Processing...' : label}
  </button>
);

// Reusable Message Box Component
export const MessageBox = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`mt-6 p-4 rounded-lg text-center font-semibold text-lg ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'} shadow-md`}>
      {message}
    </div>
  );
};

// Sign In Component (Custom UI)
export const SignIn = ({ setAuthStatus }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);
    try {
      console.log('SignIn: Attempting signIn...');
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      console.log('SignIn result:', isSignedIn, nextStep);

      setMessage('Sign in successful!');
      setMessageType('success');
    } catch (error) {
      console.error('Error signing in:', error);
      setMessage(error.message || 'Error signing in.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormWrapper title="Sign In">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@example.com" />
        <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
        <SubmitButton label="Sign In" isSubmitting={isSubmitting} />
        <MessageBox message={message} type={messageType} />
      </form>
      <p className="text-center text-gray-400 mt-6 text-base">
        Don't have an account?{' '}
        <button onClick={() => setAuthStatus('signUp')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200">Sign Up</button>
      </p>
      <p className="text-center text-gray-400 mt-3 text-base">
        <button onClick={() => setAuthStatus('forgotPassword')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200">Forgot Password?</button>
      </p>
    </AuthFormWrapper>
  );
};

// Sign Up Component (Custom UI)
export const SignUp = ({ setAuthStatus }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);
    try {
      console.log('SignUp: Attempting signUp...');
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            'custom:userId': crypto.randomUUID(), // Generate a unique userId for the custom attribute
          },
          autoSignIn: true, // Automatically sign in after confirmation
        }
      });
      console.log('SignUp result:', isSignUpComplete, userId, nextStep);

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setMessage('Sign up successful! Please check your email for a verification code.');
        setMessageType('success');
        setAuthStatus('confirmSignUp'); // Move to confirmation step
      } else if (isSignUpComplete) {
        setMessage('Sign up and auto-sign in successful!');
        setMessageType('success');
        setAuthStatus('signedIn'); // Directly go to signedIn if autoSignIn completes
      }

    } catch (error) {
      console.error('Error signing up:', error);
      setMessage(error.message || 'Error signing up.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormWrapper title="Sign Up">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@example.com" />
        <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
        <SubmitButton label="Sign Up" isSubmitting={isSubmitting} />
        <MessageBox message={message} type={messageType} />
      </form>
      <p className="text-center text-gray-400 mt-6 text-base">
        Already have an account?{' '}
        <button onClick={() => setAuthStatus('signedOut')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200">Sign In</button>
      </p>
    </AuthFormWrapper>
  );
};

// Confirm Sign Up Component (Custom UI)
export const ConfirmSignUp = ({ setAuthStatus }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);
    try {
      console.log('ConfirmSignUp: Attempting confirmSignUp...');
      const { isSignUpComplete, nextStep } = await confirmSignUp({ username: email, confirmationCode: code });
      console.log('ConfirmSignUp result:', isSignUpComplete, nextStep);

      if (isSignUpComplete) {
        setMessage('Email confirmed! You can now sign in.');
        setMessageType('success');
        setAuthStatus('signedOut'); // Go to sign in page
      }

    } catch (error) {
      console.error('Error confirming sign up:', error);
      setMessage(error.message || 'Error confirming sign up.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    setMessage('');
    setMessageType('');
    try {
      console.log('ConfirmSignUp: Attempting resendSignUpCode...');
      await resendSignUpCode({ username: email });
      setMessage('Verification code sent again!');
      setMessageType('success');
    } catch (error) {
      console.error('Error resending code:', error);
      setMessage(error.message || 'Error resending code.');
      setMessageType('error');
    }
  };

  return (
    <AuthFormWrapper title="Confirm Sign Up">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@example.com" />
        <InputField label="Verification Code" type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXXXX" />
        <SubmitButton label="Confirm" isSubmitting={isSubmitting} />
        <MessageBox message={message} type={messageType} />
      </form>
      <p className="text-center text-gray-400 mt-6 text-base">
        Didn't receive a code?{' '}
        <button onClick={() => setAuthStatus('signedOut')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200">Back to Sign In</button>
      </p>
      <p className="text-center text-gray-400 mt-3 text-base">
        <button onClick={resendCode} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200">Resend Code</button>
      </p>
    </AuthFormWrapper>
  );
};

// Forgot Password Component (Custom UI)
export const ForgotPassword = ({ setAuthStatus }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState('request'); // 'request' or 'confirm'
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);
    try {
      console.log('ForgotPassword: Attempting resetPassword...');
      await resetPassword({ username: email });
      setMessage('Verification code sent to your email.');
      setMessageType('success');
      setStage('confirm');
    } catch (error) {
      console.error('Error requesting code:', error);
      setMessage(error.message || 'Error requesting code.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);
    try {
      console.log('ForgotPassword: Attempting confirmResetPassword...');
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      setMessage('Password reset successfully! You can now sign in.');
      setMessageType('success');
      setAuthStatus('signedOut');
    } catch (error) {
      console.error('Error confirming password reset:', error);
      setMessage(error.message || 'Error resetting password.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormWrapper title="Reset Password">
      {stage === 'request' ? (
        <form onSubmit={handleRequestCode} className="space-y-5">
          <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@example.com" />
          <SubmitButton label="Send Verification Code" isSubmitting={isSubmitting} />
          <MessageBox message={message} type={messageType} />
        </form>
      ) : (
        <form onSubmit={handleConfirmPassword} className="space-y-5">
          <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@example.com" required={false} />
          <InputField label="Verification Code" type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXXXX" />
          <InputField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="********" />
          <SubmitButton label="Reset Password" isSubmitting={isSubmitting} />
          <MessageBox message={message} type={messageType} />
        </form>
      )}
      <p className="text-center text-gray-400 mt-6 text-base">
        <button onClick={() => setAuthStatus('signedOut')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200">Back to Sign In</button>
      </p>
    </AuthFormWrapper>
  );
};