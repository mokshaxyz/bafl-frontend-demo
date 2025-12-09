import React from 'react';
import './AttendanceBatchSelector.css';

const AttendanceBatchSelector = ({ selectedBatch, onBatchChange, label = 'Batch' }) => {
  const batches = ['Under 14', 'Under 17', 'Under 19'];

  const handleChange = (value) => {
    if (onBatchChange) {
      onBatchChange(value);
    } else {
      console.warn('AttendanceBatchSelector: No onBatchChange handler passed');
    }
  };

  return (
    <div className="attendance-batch-selector">
      <label htmlFor="batch-select" className="attendance-batch-selector__label">
        {label}
      </label>
      <select
        id="batch-select"
        value={selectedBatch}
        onChange={(e) => handleChange(e.target.value)}
        className="attendance-batch-selector__select"
      >
        <option value="">-- Select Batch --</option>
        {batches.map((batch) => (
          <option key={batch} value={batch}>
            {batch}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AttendanceBatchSelector;
