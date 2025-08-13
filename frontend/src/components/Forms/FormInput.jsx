import React from 'react';

const FormInput = ({ type, name, value, onChange, labelText, placeholder }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-gray-700 font-bold mb-2">
        {labelText || name}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
        required
      />
    </div>
  );
};

export default FormInput;