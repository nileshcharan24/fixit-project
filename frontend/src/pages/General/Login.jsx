import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/Forms/FormInput';
import { AppContext } from '../../contexts/AppContext';

const Login = () => {
  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  // 1. Add state to hold any login error
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError(null); // Clear error when user starts typing again
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = values;

    if (!email || !password) {
      setError('Please fill out all fields');
      return;
    }

    const result = await loginUser({ email, password });

    if (result.success) {
      setError(null); // Clear any previous errors
      navigate('/dashboard');
    } else {
      // 2. Set the error message from the backend
      setError(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Login
        </h2>

        {/* 3. Conditionally render the error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <FormInput
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          labelText="Email Address"
        />

        <FormInput
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          labelText="Password"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;