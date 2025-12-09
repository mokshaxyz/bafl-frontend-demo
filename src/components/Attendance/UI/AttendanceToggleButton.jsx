import React from 'react';
import './AttendanceToggleButton.css';

const AttendanceToggleButton = ({ status, studentId, onStatusChange }) => {
  return (
    <div className="attendance-toggle-button">
      <button
        type="button"
        className={`attendance-toggle-button__btn attendance-toggle-button__btn--present ${
          status === 'Present' ? 'attendance-toggle-button__btn--active' : ''
        }`}
        onClick={() => onStatusChange(studentId, 'Present')}
        aria-pressed={status === 'Present'}
      >
        Present
      </button>
      <button
        type="button"
        className={`attendance-toggle-button__btn attendance-toggle-button__btn--absent ${
          status === 'Absent' ? 'attendance-toggle-button__btn--active' : ''
        }`}
        onClick={() => onStatusChange(studentId, 'Absent')}
        aria-pressed={status === 'Absent'}
      >
        Absent
      </button>
    </div>
  );
};

export default AttendanceToggleButton;
