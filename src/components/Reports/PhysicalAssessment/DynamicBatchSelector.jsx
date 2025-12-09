import React from 'react';

const DynamicBatchSelector = ({ 
  selectedBatchId, 
  onBatchChange, 
  batches = [], 
  loading = false,
  label = 'Batch' 
}) => {
  const handleChange = (e) => {
    const selectedId = e.target.value ? parseInt(e.target.value, 10) : null;
    if (onBatchChange) {
      const selectedBatch = batches.find(b => b.batch_id === selectedId);
      onBatchChange(selectedBatch?.batch_name || '', selectedId);
    }
  };

  return (
    <div className="physical-assessment-report__batch-selector">
      <label className="physical-assessment-report__label">
        {label}
      </label>
      <select
        value={selectedBatchId || ''}
        onChange={handleChange}
        className="physical-assessment-report__select"
        disabled={loading || batches.length === 0}
      >
        <option value="">-- Select Batch --</option>
        {batches.map((batch) => (
          <option key={batch.batch_id} value={batch.batch_id}>
            {batch.batch_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DynamicBatchSelector;
