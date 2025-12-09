import React from 'react';
import './AttendanceSecondaryButton.css';

const AttendanceSecondaryButton = ({ label = 'Cancel', onClick, disabled = false }) => {
  return (
    <button
      type="button"
      className="attendance-secondary-button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {label}
    </button>
  );
};

export default AttendanceSecondaryButton;
