import React, { useState, useEffect } from 'react';
import './AttendanceSchoolSelector.css';
import api from '../../../services/api';

const AttendanceSchoolSelector = ({ selectedSchool, onSchoolChange, label = 'School' }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch schools from backend
  useEffect(() => {
    let cancelled = false;

    const loadSchools = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('AttendanceSchoolSelector: Fetching schools...');
        const response = await api.get('/schools/');
        console.log('AttendanceSchoolSelector: Schools response:', response.data);
        const data = Array.isArray(response.data) ? response.data : (response.data?.schools || []);
        console.log('AttendanceSchoolSelector: Parsed schools:', data);

        if (!cancelled) {
          setSchools(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('AttendanceSchoolSelector: Failed to load schools');
          console.error('Error status:', err?.response?.status);
          console.error('Error message:', err?.message);
          console.error('Error response data:', err?.response?.data);
          console.error('Full error:', err);
          setError(`Failed to load schools: ${err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Unknown error'}`);
          setSchools([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSchools();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (value) => {
    console.log('AttendanceSchoolSelector: handleChange called with value:', value);
    if (onSchoolChange) {
      // Find the school object to pass both name and id
      const selectedSchoolObj = schools.find((s) => s.name === value);
      console.log('AttendanceSchoolSelector: Found school object:', selectedSchoolObj);
      onSchoolChange(value, selectedSchoolObj?.id || null);
    } else {
      console.warn('AttendanceSchoolSelector: No onSchoolChange handler passed');
    }
  };

  return (
    <div className="attendance-school-selector">
      <label htmlFor="school-select" className="attendance-school-selector__label">
        {label}
      </label>
      <select
        id="school-select"
        value={selectedSchool}
        onChange={(e) => handleChange(e.target.value)}
        className="attendance-school-selector__select"
        disabled={loading}
      >
        <option value="">-- Select School --</option>
        {schools.length > 0 ? (
          schools.map((school) => (
            <option key={school.id} value={school.name}>
              {school.name}
            </option>
          ))
        ) : (
          <option disabled value="">
            {loading ? 'Loading schools...' : error ? 'Failed to load schools' : 'No schools available'}
          </option>
        )}
      </select>
      {error && <div className="attendance-school-selector__error">{error}</div>}
    </div>
  );
};

export default AttendanceSchoolSelector;
