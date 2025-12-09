import React, { useState, useRef, useEffect } from 'react';
import './CustomDatePicker.css';
import { ReactComponent as DateIcon } from '../icons/date.svg';

export default function CustomDatePicker({ value, onChange, placeholder = "Select date" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    const formattedDate = newDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange('');
  };

  const formatDisplayDate = (date) => {
    if (!date) return placeholder;
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only
  
  const isToday = (day) => {
    return today.getDate() === day &&
           today.getMonth() === month &&
           today.getFullYear() === year;
  };

  const isFutureDate = (day) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === month &&
           selectedDate.getFullYear() === year;
  };

  return (
    <div className="custom-date-picker" ref={pickerRef}>
      <div className="custom-date-picker__input" onClick={() => setIsOpen(!isOpen)}>
        <span className={`custom-date-picker__value ${!selectedDate ? 'placeholder' : ''}`}>
          {formatDisplayDate(selectedDate)}
        </span>
        <div className="custom-date-picker__icons">
          {selectedDate && (
            <button
              className="custom-date-picker__clear"
              onClick={handleClear}
              aria-label="Clear date"
            >
              ×
            </button>
          )}
          <span className="custom-date-picker__icon">
            <DateIcon />
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="custom-date-picker__dropdown">
          <div className="custom-date-picker__header">
            <button
              className="custom-date-picker__nav"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="custom-date-picker__month-year">
              {monthNames[month]} {year}
            </span>
            <button
              className="custom-date-picker__nav"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="custom-date-picker__calendar">
            <div className="custom-date-picker__weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="custom-date-picker__weekday">{day}</div>
              ))}
            </div>

            <div className="custom-date-picker__days">
              {/* Empty cells for days before month starts */}
              {[...Array(startingDayOfWeek)].map((_, index) => (
                <div key={`empty-${index}`} className="custom-date-picker__day empty" />
              ))}

              {/* Actual days of the month */}
              {[...Array(daysInMonth)].map((_, index) => {
                const day = index + 1;
                const isFuture = isFutureDate(day);
                return (
                  <button
                    key={day}
                    className={`custom-date-picker__day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${isFuture ? 'disabled' : ''}`}
                    onClick={() => !isFuture && handleDateSelect(day)}
                    disabled={isFuture}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
