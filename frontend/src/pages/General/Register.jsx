import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/Forms/FormInput';
import { AppContext } from '../../contexts/AppContext';

const Register = () => {
  const { registerUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    apartmentNumber: '',
    phone: '',
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!values.name || !values.email || !values.password) {
      console.log('Please fill out all required fields');
      return;
    }

    const result = await registerUser(values);

    if (result.success) {
      navigate('/dashboard');
    }
    // Note: Error logging is now handled within the registerUser function
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Register
        </h2>

        <FormInput
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          labelText="Name"
        />
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
        <FormInput
          type="text"
          name="apartmentNumber"
          value={values.apartmentNumber}
          onChange={handleChange}
          labelText="Apartment Number"
        />
        <FormInput
          type="tel"
          name="phone"
          value={values.phone}
          onChange={handleChange}
          labelText="Phone Number"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Register;