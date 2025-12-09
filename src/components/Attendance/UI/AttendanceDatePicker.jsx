import React from 'react';
import './AttendanceDatePicker.css';

const AttendanceDatePicker = ({ selectedDate, onDateChange, label = 'Select Date' }) => {
  return (
    <div className="attendance-date-picker">
      <label htmlFor="attendance-date-input" className="attendance-date-picker__label">
        {label}
      </label>
      <input
        id="attendance-date-input"
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="attendance-date-picker__input"
      />
    </div>
  );
};

export default AttendanceDatePicker;
