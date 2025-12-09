import React from 'react';
import './AttendancePrimaryButton.css';

const AttendancePrimaryButton = ({ label = 'Save', onClick, disabled = false }) => {
  return (
    <button
      type="button"
      className="attendance-primary-button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {label}
    </button>
  );
};

export default AttendancePrimaryButton;
