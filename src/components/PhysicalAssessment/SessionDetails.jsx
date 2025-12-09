import React, { useEffect, useMemo, useState } from 'react';
import './SessionDetails.css';
import { ReactComponent as BackIcon } from '../icons/Back.svg';
import * as XLSX from 'xlsx';

const metricMeta = [
  { key: 'curlUp', label: 'Curl Up (Counts)', decimals: 0 },
  { key: 'pushUp', label: 'Push Up (Counts)', decimals: 0 },
  { key: 'sitAndReach', label: 'Sit & Reach (cm)', decimals: 1 },
  { key: 'walk600m', label: '600m Walk (min)', decimals: 1 },
  { key: 'sprint50m', label: '50m Sprint (sec)', decimals: 2 },
  { key: 'bowHoldingTest', label: 'Bow Holding / One Hand Plank (sec)', decimals: 0 },
  { key: 'plank', label: 'Plank (min)', decimals: 2 }
];

const formatNumber = (value, decimals) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }
  const parsed = Number(value);
  return decimals === 0 ? Math.round(parsed).toString() : parsed.toFixed(decimals);
};

export default function SessionDetails({ session, onBack }) {
  const formattedDate = useMemo(() => {
    if (!session?.date) {
      return 'N/A';
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(session.date).toLocaleDateString('en-US', options);
  }, [session]);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm('');
  }, [session?.id]);

  const filteredParticipants = useMemo(() => {
    if (!session?.participants?.length) {
      return [];
    }
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return session.participants;
    }
    return session.participants.filter((participant) =>
      participant.name.toLowerCase().includes(query)
    );
  }, [searchTerm, session]);

  const averages = useMemo(() => {
    if (!filteredParticipants.length) {
      return {};
    }

    const totals = {};
    const counts = {};

    metricMeta.forEach(({ key }) => {
      totals[key] = 0;
      counts[key] = 0;
    });

    filteredParticipants.forEach((participant) => {
      metricMeta.forEach(({ key }) => {
        const value = participant.metrics?.[key];
        if (value !== null && value !== undefined && !Number.isNaN(Number(value))) {
          totals[key] += Number(value);
          counts[key] += 1;
        }
      });
    });

    return metricMeta.reduce((acc, { key }) => {
      if (counts[key] === 0) {
        acc[key] = null;
      } else {
        acc[key] = totals[key] / counts[key];
      }
      return acc;
    }, {});
  }, [filteredParticipants]);

  const handleDownloadExcel = () => {
    if (!session?.participants?.length) {
      return;
    }

    // Prepare data for Excel
    const excelData = [];

    // Add header row
    const headerRow = ['Name', 'Discipline'];
    metricMeta.forEach(({ label }) => {
      headerRow.push(label);
    });
    excelData.push(headerRow);

    // Add participant rows
    filteredParticipants.forEach((participant) => {
      const row = [
        participant.name,
        ['Yes', 'Slightly', 'No'].includes(participant.discipline) ? participant.discipline : '—'
      ];
      metricMeta.forEach(({ key, decimals }) => {
        const value = participant.metrics?.[key];
        if (value === null || value === undefined || Number.isNaN(Number(value))) {
          row.push('—');
        } else {
          const parsed = Number(value);
          row.push(decimals === 0 ? Math.round(parsed) : parsed);
        }
      });
      excelData.push(row);
    });

    // Add session average row
    if (filteredParticipants.length > 0) {
      const avgRow = ['Session Avg', ''];
      metricMeta.forEach(({ key, decimals }) => {
        const avgValue = averages[key];
        if (avgValue === null || avgValue === undefined || Number.isNaN(Number(avgValue))) {
          avgRow.push('—');
        } else {
          avgRow.push(decimals === 0 ? Math.round(avgValue) : Number(avgValue.toFixed(decimals)));
        }
      });
      excelData.push(avgRow);
    }

    // Create worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participant Metrics');

    // Generate filename with date
    const dateStr = session.date ? new Date(session.date).toISOString().split('T')[0] : 'unknown';
    const filename = `session_${dateStr}_${session.coach || 'coach'}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };

  if (!session) {
    return null;
  }

  const participantCount = session.participants?.length || 0;
  const visibleCount = filteredParticipants.length;
  const hasSearch = searchTerm.trim().length > 0;

  return (
    <div className="session-details">
      <button type="button" className="session-details__back-button" onClick={onBack}>
        <BackIcon className="session-details__back-icon" />
        Back to sessions
      </button>

      <div className="session-details__header-actions">
        <header className="session-details__header">
          <div>
            <h3 className="session-details__title">Session Details</h3>
          </div>
        </header>
        <button type="button" className="session-details__edit-button">
          Edit Session
        </button>
      </div>

      <section className="session-details__summary">
        <div className="session-details__summary-item">
          <span className="session-details__summary-label">Date</span>
          <span className="session-details__summary-value">{formattedDate}</span>
        </div>
        <div className="session-details__summary-item">
          <span className="session-details__summary-label">Coach</span>
          <span className="session-details__summary-value">{session.coach}</span>
        </div>
        <div className="session-details__summary-item">
          <span className="session-details__summary-label">Total No. of Students</span>
          <span className="session-details__summary-value">{participantCount}</span>
        </div>
        <div className="session-details__summary-item">
          <span className="session-details__summary-label">Attendees</span>
          <span className="session-details__summary-value">{session.attendees}</span>
        </div>
        <div className="session-details__summary-item">
          <span className="session-details__summary-label">Batch</span>
          <span className="session-details__summary-value">{session.batch || 'N/A'}</span>
        </div>
        <div className="session-details__summary-item">
          <span className="session-details__summary-label">School</span>
          <span className="session-details__summary-value">{session.school || 'N/A'}</span>
        </div>
      </section>

      <div className="session-details__metrics-header">
        <h3 className="session-details__title session-details__title--table">Participant Metrics</h3>
        <div className="add-session__search session-details__search">
          <input
            type="text"
            className="add-session__search-input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name..."
            aria-label="Search athletes by name"
          />
          {searchTerm && (
            <button
              type="button"
              className="add-session__search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <section className="session-details__table-section">
        <span className="session-details__table-caption">
          Showing {visibleCount} of {participantCount} athlete{participantCount === 1 ? '' : 's'}
        </span>
        <div className="session-details__table-wrapper">
          <table className="session-details__table" role="table" aria-label="Participant metrics table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Discipline</th>
                {metricMeta.map(({ key, label }) => (
                  <th key={key} scope="col">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant) => (
                <tr key={participant.id}>
                  <td className="session-details__participant-name">{participant.name}</td>
                  <td>{['Yes', 'Slightly', 'No'].includes(participant.discipline) ? participant.discipline : '—'}</td>
                  {metricMeta.map(({ key, decimals }) => (
                    <td key={key}>{formatNumber(participant.metrics?.[key], decimals)}</td>
                  ))}
                </tr>
              ))}
              {!filteredParticipants.length && (
                <tr>
                  <td colSpan={2 + metricMeta.length} className="session-details__empty">
                    {hasSearch
                      ? 'No athlete metrics match your search.'
                      : 'No athlete metrics recorded for this session.'}
                  </td>
                </tr>
              )}
            </tbody>
            {filteredParticipants.length ? (
              <tfoot>
                <tr>
                  <td className="session-details__average-label">Session Avg</td>
                  <td aria-hidden="true" />
                  {metricMeta.map(({ key, decimals }) => (
                    <td key={key}>{formatNumber(averages[key], decimals)}</td>
                  ))}
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
        <div className="session-details__table-actions">
          <button 
            type="button" 
            className="session-details__analyze-button"
            disabled={!session.participants?.length}
          >
            Analyze Performance
          </button>
          <button 
            type="button" 
            className="session-details__download-button"
            onClick={handleDownloadExcel}
            disabled={!session.participants?.length}
          >
            Download Excel
          </button>
        </div>
      </section>
    </div>
  );
}
