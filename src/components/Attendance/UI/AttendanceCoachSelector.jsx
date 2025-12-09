import React, { useState, useEffect } from 'react';
import './AttendanceCoachSelector.css';
import api from '../../../services/api';

const AttendanceCoachSelector = ({
  selectedCoach,
  onCoachChange,
  label = 'Session Taken By',
  selectedSchool = '',
}) => {
  const [hasCoaches, setHasCoaches] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper: Map school name to synthetic coach label
  const getCoachLabelForSchool = (schoolName) => {
    if (!schoolName) return '';
    const name = String(schoolName).toLowerCase();
    if (name.includes('avasara')) return 'coach_avsara';
    if (name.includes('akanksha')) return 'coach_akschools';
    return '';
  };

  // Fetch coaches to check if school has coaches (but don't show real names)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const checkCoaches = async () => {
      if (!selectedSchool) {
        setHasCoaches(false);
        setLoading(false);
        return;
      }

      try {
        // For now, we'll just assume coaches exist based on school name
        // In a real scenario, you'd fetch from /coaches?school_id=...
        const label = getCoachLabelForSchool(selectedSchool);
        if (!cancelled) {
          setHasCoaches(!!label);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to check coaches', err);
          setHasCoaches(false);
          setLoading(false);
        }
      }
    };

    checkCoaches();
    return () => { cancelled = true; };
  }, [selectedSchool]);

  const coachLabel = getCoachLabelForSchool(selectedSchool);

  const handleChange = (value) => {
    if (onCoachChange) {
      onCoachChange(value);
    }
  };

  return (
    <div className="attendance-coach-selector">
      <label htmlFor="coach-select" className="attendance-coach-selector__label">
        {label}
      </label>
      <select
        id="coach-select"
        value={selectedCoach || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="attendance-coach-selector__select"
        disabled={!hasCoaches || loading}
      >
        <option value="">-- Select Coach --</option>
        {hasCoaches && coachLabel && (
          <option value={coachLabel}>{coachLabel}</option>
        )}
      </select>
      {!hasCoaches && !loading && selectedSchool && (
        <div className="attendance-coach-selector__info">No coach assigned</div>
      )}
    </div>
  );
};

export default AttendanceCoachSelector;