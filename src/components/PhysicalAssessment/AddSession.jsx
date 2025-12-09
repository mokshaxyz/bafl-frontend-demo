import React, { useState, useEffect } from 'react';
import './AddSession.css';
import CustomDatePicker from './CustomDatePicker';
import logger from '../../utils/logger';
import { ReactComponent as BackIcon } from '../icons/Back.svg';

const addSessionLogger = logger.createChildLogger('AddSession');

export default function AddSession({ onCancel, onSave }) {
  const [sessionDate, setSessionDate] = useState('');
  const [coachName, setCoachName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({
    sessionDate: false,
    coachName: false,
    students: {}
  });
  
  // Mock student data - TODO: Replace with API call
  // Expected API: GET /api/v1/students or similar
  // Response: { students: [{ id, name }] }
  const [students, setStudents] = useState([
    { id: 1, name: 'Alice Johnson' },
    { id: 2, name: 'Bob Smith' },
    { id: 3, name: 'Charlie Brown' },
    { id: 4, name: 'Diana Prince' },
    { id: 5, name: 'Ethan Hunt' },
    { id: 6, name: 'Fiona Green' },
    { id: 7, name: 'George Wilson' },
    { id: 8, name: 'Hannah Lee' },
    { id: 9, name: 'Isaac Newton' },
    { id: 10, name: 'Julia Roberts' },
    { id: 11, name: 'Kevin Hart' },
    { id: 12, name: 'Laura Palmer' },
    { id: 13, name: 'Michael Scott' }
  ]);

  // Assessment data for each student
  const [assessments, setAssessments] = useState({});

  // Initialize assessment data when students load
  useEffect(() => {
    const initialAssessments = {};
    students.forEach(student => {
      initialAssessments[student.id] = {
        discipline: '',
        curlUp: '',
        pushUp: '',
        sitAndReach: '',
        walk600m: '',
        sprint50m: '',
        bowHoldingTest: '',
        plank: ''
      };
    });
    setAssessments(initialAssessments);
  }, [students]);

  const handleInputChange = (studentId, field, value) => {
    setAssessments(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    addSessionLogger.info('Attempting to save session data', {
      date: sessionDate,
      coach: coachName,
      studentsCount: students.length
    });

    // Validate required fields
    const newErrors = {
      sessionDate: !sessionDate,
      coachName: !coachName.trim(),
      students: {}
    };

    // Check if all students have discipline and at least one metric filled
    students.forEach(student => {
      const assessment = assessments[student.id];
      const hasAnyMetric = assessment && (
        assessment.curlUp || 
        assessment.pushUp || 
        assessment.sitAndReach || 
        assessment.walk600m || 
        assessment.sprint50m || 
        assessment.bowHoldingTest || 
        assessment.plank
      );

      newErrors.students[student.id] = {
        discipline: !assessment?.discipline,
        hasEmptyFields: !assessment?.discipline || !hasAnyMetric
      };
    });

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = newErrors.sessionDate || 
                      newErrors.coachName || 
                      Object.values(newErrors.students).some(s => s.hasEmptyFields);

    if (hasErrors) {
      addSessionLogger.warn('Validation failed: Empty required fields detected');
      return;
    }

    // Prepare data for API
    const sessionData = {
      date: sessionDate,
      coach: coachName,
      assessments: students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        discipline: assessments[student.id]?.discipline || '',
        metrics: assessments[student.id]
      }))
    };

    console.log('Session data to save:', sessionData);
    addSessionLogger.info('Saving session data');
    
    // TODO: Make API call to save session
    // Example:
    // fetch('/api/v1/sessions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(sessionData)
    // }).then(response => {
    //   if (response.ok) {
    //     onSave();
    //   }
    // });

    // For now, just call onSave callback
    onSave();
  };

  const handleCancel = () => {
    addSessionLogger.info('Add session cancelled');
    onCancel();
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="add-session">
      <div className="add-session__title-container">
        <button
          type="button"
          className="add-session__back-button"
          onClick={handleCancel}
          aria-label="Go back"
        >
          <BackIcon className="add-session__back-icon" />
          Back
        </button>
      </div>
      
      <div className="add-session__header">
        <div className={`add-session__date-picker ${errors.sessionDate ? 'has-error' : ''}`}>
          <CustomDatePicker
            value={sessionDate}
            onChange={(date) => {
              setSessionDate(date);
              setErrors(prev => ({ ...prev, sessionDate: false }));
            }}
            placeholder="Select session date"
          />
          {errors.sessionDate && (
            <span className="add-session__error-message">Session date is required</span>
          )}
        </div>

        <div className="add-session__search">
          <input
            type="text"
            className="add-session__search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
          />
          {searchTerm && (
            <button
              className="add-session__search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="add-session__table-container">
        <table className="add-session__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Discipline</th>
              <th>Curl Up<br/>(Counts)</th>
              <th>Push Up<br/>(Counts)</th>
              <th>Sit and Reach<br/>(cm)</th>
              <th>600m Walk<br/>(min)</th>
              <th>50m Sprint<br/>(seconds)</th>
              <th>Bow Holding/<br/>One Hand Plank<br/>(seconds)</th>
              <th>Plank<br/>(Mins)</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td className="add-session__student-name">{student.name}</td>
                <td className="add-session__discipline">
                  <select
                    className={`add-session__table-select ${errors.students[student.id]?.discipline ? 'add-session__table-select--error' : ''}`}
                    value={assessments[student.id]?.discipline || ''}
                    onChange={(e) => {
                      handleInputChange(student.id, 'discipline', e.target.value);
                      setErrors(prev => ({
                        ...prev,
                        students: {
                          ...prev.students,
                          [student.id]: { ...prev.students[student.id], discipline: false }
                        }
                      }));
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="Slightly">Slightly</option>
                    <option value="No">No</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    className="add-session__table-input"
                    value={assessments[student.id]?.curlUp || ''}
                    onChange={(e) => handleInputChange(student.id, 'curlUp', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="add-session__table-input"
                    value={assessments[student.id]?.pushUp || ''}
                    onChange={(e) => handleInputChange(student.id, 'pushUp', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="add-session__table-input"
                    value={assessments[student.id]?.sitAndReach || ''}
                    onChange={(e) => handleInputChange(student.id, 'sitAndReach', e.target.value)}
                    placeholder="0"
                    step="0.1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="add-session__table-input"
                    value={assessments[student.id]?.walk600m || ''}
                    onChange={(e) => handleInputChange(student.id, 'walk600m', e.target.value)}
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="add-session__table-input"
                    value={assessments[student.id]?.sprint50m || ''}
                    onChange={(e) => handleInputChange(student.id, 'sprint50m', e.target.value)}
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="add-session__table-input"
                    value={assessments[student.id]?.bowHoldingTest || ''}
                    onChange={(e) => handleInputChange(student.id, 'bowHoldingTest', e.target.value)}
                    placeholder="0"
                    step="0.1"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="add-session__table-input"
                    value={assessments[student.id]?.plank || ''}
                    onChange={(e) => handleInputChange(student.id, 'plank', e.target.value)}
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="add-session__actions">
        <div className="add-session__coach-input">
          <label className="add-session__label">Coach Name</label>
          <div className="add-session__input-wrapper">
            <input
              type="text"
              className={`add-session__input ${errors.coachName ? 'add-session__input--error' : ''}`}
              value={coachName}
              onChange={(e) => {
                setCoachName(e.target.value);
                setErrors(prev => ({ ...prev, coachName: false }));
              }}
              placeholder="Enter coach name"
            />
            {errors.coachName && (
              <span className="add-session__error-message">Coach name is required</span>
            )}
          </div>
        </div>
        
        <div className="add-session__action-buttons">
          <button
            type="button"
            className="add-session__button add-session__button--save"
            onClick={handleSave}
          >
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
}
