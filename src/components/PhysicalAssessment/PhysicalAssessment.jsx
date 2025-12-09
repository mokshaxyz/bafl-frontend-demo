import React, { useMemo, useState } from 'react';
import './PhysicalAssessment.css';
import CustomDatePicker from './CustomDatePicker';
import AddSession from './AddSession';
import SessionDetails from './SessionDetails';
import logger from '../../utils/logger';

const paLogger = logger.createChildLogger('PhysicalAssessment');

export default function PhysicalAssessment() {
  const [selectedDate, setSelectedDate] = useState('');
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Mock data for past sessions - replace with actual API call later
  // TODO: Replace with API call - Expected format:
  // GET /api/v1/sessions or similar
  // Response: { sessions: [{ id, date, attendees, coach, participants: [...] }] }
  const [sessions] = useState([
    {
      id: 1,
      date: '2025-11-15',
      attendees: 15,
      coach: 'John Smith',
      duration: '2h 15m',
      location: 'National Training Center',
      batch: 'Senior Squad A',
      school: 'National Archery Training Centre',
      participants: [
        {
          id: 'ath-101',
          name: 'Alice Johnson',
          discipline: 'Yes',
          metrics: {
            curlUp: 38,
            pushUp: 24,
            sitAndReach: 29,
            walk600m: 6.1,
            sprint50m: 7.2,
            bowHoldingTest: 85,
            plank: 2.5
          }
        },
        {
          id: 'ath-102',
          name: 'Bob Smith',
          discipline: 'Slightly',
          metrics: {
            curlUp: 32,
            pushUp: 22,
            sitAndReach: 26,
            walk600m: 6.4,
            sprint50m: 7.5,
            bowHoldingTest: 78,
            plank: 2.1
          }
        },
        {
          id: 'ath-103',
          name: 'Charlie Brown',
          discipline: 'No',
          metrics: {
            curlUp: 28,
            pushUp: 18,
            sitAndReach: 24,
            walk600m: 6.8,
            sprint50m: 7.8,
            bowHoldingTest: 80,
            plank: 1.9
          }
        },
        {
          id: 'ath-113',
          name: 'Monica Reyes',
          discipline: 'Yes',
          metrics: {
            curlUp: 34,
            pushUp: 23,
            sitAndReach: 30,
            walk600m: 6.2,
            sprint50m: 7.4,
            bowHoldingTest: 86,
            plank: 2.2
          }
        },
        {
          id: 'ath-114',
          name: 'Noah Carter',
          discipline: 'Slightly',
          metrics: {
            curlUp: 31,
            pushUp: 21,
            sitAndReach: 27,
            walk600m: 6.5,
            sprint50m: 7.6,
            bowHoldingTest: 79,
            plank: 2.0
          }
        },
        {
          id: 'ath-120',
          name: 'Priya Sharma',
          discipline: 'Yes',
          metrics: {
            curlUp: 36,
            pushUp: 24,
            sitAndReach: 31,
            walk600m: 6.1,
            sprint50m: 7.3,
            bowHoldingTest: 87,
            plank: 2.3
          }
        },
        {
          id: 'ath-121',
          name: 'Leo Martinez',
          discipline: 'Slightly',
          metrics: {
            curlUp: 29,
            pushUp: 20,
            sitAndReach: 26,
            walk600m: 6.7,
            sprint50m: 7.8,
            bowHoldingTest: 82,
            plank: 1.9
          }
        },
        {
          id: 'ath-122',
          name: 'Mei Chen',
          discipline: 'Yes',
          metrics: {
            curlUp: 35,
            pushUp: 23,
            sitAndReach: 32,
            walk600m: 6.2,
            sprint50m: 7.4,
            bowHoldingTest: 89,
            plank: 2.5
          }
        },
        {
          id: 'ath-123',
          name: 'Sophia Walker',
          discipline: 'No',
          metrics: {
            curlUp: 27,
            pushUp: 17,
            sitAndReach: 25,
            walk600m: 6.9,
            sprint50m: 7.9,
            bowHoldingTest: 74,
            plank: 1.8
          }
        }
      ]
    },
    {
      id: 2,
      date: '2025-11-10',
      attendees: 12,
      coach: 'Sarah Johnson',
      duration: '1h 50m',
      location: 'Indoor Range B',
      batch: 'Intermediate Squad B',
      school: 'National Archery Training Centre',
      participants: [
        {
          id: 'ath-104',
          name: 'Diana Prince',
          discipline: 'Yes',
          metrics: {
            curlUp: 34,
            pushUp: 21,
            sitAndReach: 31,
            walk600m: 6.3,
            sprint50m: 7.4,
            bowHoldingTest: 88,
            plank: 2.4
          }
        },
        {
          id: 'ath-105',
          name: 'Ethan Hunt',
          discipline: 'Slightly',
          metrics: {
            curlUp: 29,
            pushUp: 20,
            sitAndReach: 27,
            walk600m: 6.6,
            sprint50m: 7.6,
            bowHoldingTest: 82,
            plank: 2.0
          }
        },
        {
          id: 'ath-106',
          name: 'Fiona Green',
          discipline: 'No',
          metrics: {
            curlUp: 31,
            pushUp: 19,
            sitAndReach: 30,
            walk600m: 6.5,
            sprint50m: 7.7,
            bowHoldingTest: 75,
            plank: 2.2
          }
        },
        {
          id: 'ath-115',
          name: 'Olivia Benson',
          discipline: 'Yes',
          metrics: {
            curlUp: 37,
            pushUp: 24,
            sitAndReach: 32,
            walk600m: 6.1,
            sprint50m: 7.3,
            bowHoldingTest: 88,
            plank: 2.4
          }
        },
        {
          id: 'ath-116',
          name: 'Paul Kim',
          discipline: 'No',
          metrics: {
            curlUp: 28,
            pushUp: 18,
            sitAndReach: 26,
            walk600m: 6.7,
            sprint50m: 7.8,
            bowHoldingTest: 76,
            plank: 1.9
          }
        },
        {
          id: 'ath-125',
          name: 'Ivy Thompson',
          discipline: 'Slightly',
          metrics: {
            curlUp: 30,
            pushUp: 19,
            sitAndReach: 28,
            walk600m: 6.6,
            sprint50m: 7.7,
            bowHoldingTest: 80,
            plank: 2.0
          }
        },
        {
          id: 'ath-126',
          name: 'Jonas Becker',
          discipline: 'Yes',
          metrics: {
            curlUp: 33,
            pushUp: 22,
            sitAndReach: 29,
            walk600m: 6.4,
            sprint50m: 7.5,
            bowHoldingTest: 86,
            plank: 2.1
          }
        },
        {
          id: 'ath-127',
          name: 'Kara Ibrahim',
          discipline: 'No',
          metrics: {
            curlUp: 26,
            pushUp: 16,
            sitAndReach: 24,
            walk600m: 7.0,
            sprint50m: 8.0,
            bowHoldingTest: 72,
            plank: 1.6
          }
        },
        {
          id: 'ath-128',
          name: 'Luca Romano',
          discipline: 'Yes',
          metrics: {
            curlUp: 35,
            pushUp: 23,
            sitAndReach: 31,
            walk600m: 6.2,
            sprint50m: 7.4,
            bowHoldingTest: 88,
            plank: 2.3
          }
        },
        {
          id: 'ath-129',
          name: 'Maya Flores',
          discipline: 'Slightly',
          metrics: {
            curlUp: 28,
            pushUp: 18,
            sitAndReach: 27,
            walk600m: 6.7,
            sprint50m: 7.8,
            bowHoldingTest: 79,
            plank: 1.9
          }
        }
      ]
    },
    {
      id: 3,
      date: '2025-11-05',
      attendees: 18,
      coach: 'Mike Davis',
      duration: '2h 05m',
      location: 'Outdoor Range C',
      batch: 'Senior Squad B',
      school: 'National Archery Training Centre',
      participants: [
        {
          id: 'ath-107',
          name: 'George Wilson',
          discipline: 'Yes',
          metrics: {
            curlUp: 36,
            pushUp: 23,
            sitAndReach: 28,
            walk600m: 6.0,
            sprint50m: 7.1,
            bowHoldingTest: 90,
            plank: 2.3
          }
        },
        {
          id: 'ath-108',
          name: 'Hannah Lee',
          discipline: 'Slightly',
          metrics: {
            curlUp: 33,
            pushUp: 22,
            sitAndReach: 27,
            walk600m: 6.2,
            sprint50m: 7.2,
            bowHoldingTest: 84,
            plank: 2.0
          }
        },
        {
          id: 'ath-109',
          name: 'Isaac Newton',
          discipline: 'No',
          metrics: {
            curlUp: 27,
            pushUp: 17,
            sitAndReach: 25,
            walk600m: 6.9,
            sprint50m: 7.9,
            bowHoldingTest: 77,
            plank: 1.8
          }
        },
        {
          id: 'ath-117',
          name: 'Quinn Harper',
          discipline: 'Yes',
          metrics: {
            curlUp: 35,
            pushUp: 23,
            sitAndReach: 29,
            walk600m: 6.0,
            sprint50m: 7.2,
            bowHoldingTest: 85,
            plank: 2.1
          }
        },
        {
          id: 'ath-130',
          name: 'Nate Rivers',
          discipline: 'Slightly',
          metrics: {
            curlUp: 31,
            pushUp: 20,
            sitAndReach: 27,
            walk600m: 6.5,
            sprint50m: 7.6,
            bowHoldingTest: 83,
            plank: 2.0
          }
        },
        {
          id: 'ath-131',
          name: 'Olga Petrova',
          discipline: 'Yes',
          metrics: {
            curlUp: 37,
            pushUp: 24,
            sitAndReach: 30,
            walk600m: 6.1,
            sprint50m: 7.3,
            bowHoldingTest: 90,
            plank: 2.4
          }
        },
        {
          id: 'ath-132',
          name: 'Pedro Alvarez',
          discipline: 'No',
          metrics: {
            curlUp: 25,
            pushUp: 15,
            sitAndReach: 23,
            walk600m: 7.1,
            sprint50m: 8.1,
            bowHoldingTest: 70,
            plank: 1.5
          }
        },
        {
          id: 'ath-133',
          name: 'Riya Kapoor',
          discipline: 'Yes',
          metrics: {
            curlUp: 34,
            pushUp: 22,
            sitAndReach: 28,
            walk600m: 6.3,
            sprint50m: 7.4,
            bowHoldingTest: 86,
            plank: 2.2
          }
        },
        {
          id: 'ath-134',
          name: 'Seth Williams',
          discipline: 'Slightly',
          metrics: {
            curlUp: 29,
            pushUp: 19,
            sitAndReach: 26,
            walk600m: 6.8,
            sprint50m: 7.9,
            bowHoldingTest: 78,
            plank: 1.8
          }
        },
        {
          id: 'ath-140',
          name: 'Zoey Clark',
          discipline: 'No',
          metrics: {
            curlUp: 26,
            pushUp: 16,
            sitAndReach: 24,
            walk600m: 6.9,
            sprint50m: 8.0,
            bowHoldingTest: 73,
            plank: 1.6
          }
        },
        {
          id: 'ath-141',
          name: 'Amelia Nguyen',
          discipline: 'Yes',
          metrics: {
            curlUp: 38,
            pushUp: 25,
            sitAndReach: 31,
            walk600m: 6.0,
            sprint50m: 7.2,
            bowHoldingTest: 92,
            plank: 2.4
          }
        },
        {
          id: 'ath-142',
          name: 'Blake Turner',
          discipline: 'Slightly',
          metrics: {
            curlUp: 32,
            pushUp: 21,
            sitAndReach: 27,
            walk600m: 6.4,
            sprint50m: 7.5,
            bowHoldingTest: 81,
            plank: 2.0
          }
        },
        {
          id: 'ath-143',
          name: 'Camila Ortiz',
          discipline: 'No',
          metrics: {
            curlUp: 28,
            pushUp: 17,
            sitAndReach: 25,
            walk600m: 6.8,
            sprint50m: 7.9,
            bowHoldingTest: 76,
            plank: 1.8
          }
        },
        {
          id: 'ath-144',
          name: 'Damian Silva',
          discipline: 'Slightly',
          metrics: {
            curlUp: 30,
            pushUp: 20,
            sitAndReach: 26,
            walk600m: 6.6,
            sprint50m: 7.7,
            bowHoldingTest: 79,
            plank: 1.9
          }
        },
        {
          id: 'ath-145',
          name: 'Elena Rossi',
          discipline: 'Yes',
          metrics: {
            curlUp: 37,
            pushUp: 24,
            sitAndReach: 30,
            walk600m: 6.1,
            sprint50m: 7.3,
            bowHoldingTest: 88,
            plank: 2.2
          }
        }
      ]
    },
    {
      id: 4,
      date: '2025-10-28',
      attendees: 20,
      coach: 'Emily Brown',
      duration: '1h 40m',
      location: 'Indoor Range A',
      batch: 'Development Squad A',
      school: 'National Archery Training Centre',
      participants: [
        {
          id: 'ath-110',
          name: 'Julia Roberts',
          discipline: 'Yes',
          metrics: {
            curlUp: 30,
            pushUp: 19,
            sitAndReach: 28,
            walk600m: 6.7,
            sprint50m: 7.6,
            bowHoldingTest: 74,
            plank: 1.9
          }
        },
        {
          id: 'ath-111',
          name: 'Kevin Hart',
          discipline: 'Slightly',
          metrics: {
            curlUp: 26,
            pushUp: 17,
            sitAndReach: 24,
            walk600m: 7.0,
            sprint50m: 8.1,
            bowHoldingTest: 71,
            plank: 1.7
          }
        },
        {
          id: 'ath-112',
          name: 'Laura Palmer',
          discipline: 'No',
          metrics: {
            curlUp: 28,
            pushUp: 18,
            sitAndReach: 25,
            walk600m: 6.8,
            sprint50m: 7.9,
            bowHoldingTest: 73,
            plank: 1.8
          }
        },
        {
          id: 'ath-118',
          name: 'Rita Singh',
          discipline: 'Slightly',
          metrics: {
            curlUp: 30,
            pushUp: 20,
            sitAndReach: 27,
            walk600m: 6.6,
            sprint50m: 7.7,
            bowHoldingTest: 78,
            plank: 2.0
          }
        },
        {
          id: 'ath-119',
          name: 'Samir Patel',
          discipline: 'Yes',
          metrics: {
            curlUp: 33,
            pushUp: 22,
            sitAndReach: 29,
            walk600m: 6.5,
            sprint50m: 7.5,
            bowHoldingTest: 81,
            plank: 2.1
          }
        },
        {
          id: 'ath-135',
          name: 'Tara Singh',
          discipline: 'Slightly',
          metrics: {
            curlUp: 30,
            pushUp: 19,
            sitAndReach: 27,
            walk600m: 6.6,
            sprint50m: 7.7,
            bowHoldingTest: 79,
            plank: 1.9
          }
        },
        {
          id: 'ath-136',
          name: 'Umar Farooq',
          discipline: 'No',
          metrics: {
            curlUp: 24,
            pushUp: 14,
            sitAndReach: 22,
            walk600m: 7.2,
            sprint50m: 8.2,
            bowHoldingTest: 69,
            plank: 1.4
          }
        },
        {
          id: 'ath-137',
          name: 'Valerie Chen',
          discipline: 'Yes',
          metrics: {
            curlUp: 36,
            pushUp: 23,
            sitAndReach: 30,
            walk600m: 6.2,
            sprint50m: 7.4,
            bowHoldingTest: 88,
            plank: 2.3
          }
        },
        {
          id: 'ath-138',
          name: 'Wesley Brooks',
          discipline: 'Slightly',
          metrics: {
            curlUp: 28,
            pushUp: 18,
            sitAndReach: 26,
            walk600m: 6.8,
            sprint50m: 7.9,
            bowHoldingTest: 77,
            plank: 1.8
          }
        },
        {
          id: 'ath-139',
          name: 'Yara Mendes',
          discipline: 'Yes',
          metrics: {
            curlUp: 34,
            pushUp: 21,
            sitAndReach: 28,
            walk600m: 6.4,
            sprint50m: 7.6,
            bowHoldingTest: 84,
            plank: 2.0
          }
        }
      ]
    }
  ]);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) || null,
    [selectedSessionId, sessions]
  );

  const handleAddSession = () => {
    paLogger.info('Add Session button clicked');
    setSelectedSessionId(null);
    setIsAddingSession(true);
  };

  const handleCancelAdd = () => {
    paLogger.info('Add session cancelled');
    setSelectedSessionId(null);
    setIsAddingSession(false);
  };

  const handleSaveSession = () => {
    paLogger.info('Session saved successfully');
    setSelectedSessionId(null);
    setIsAddingSession(false);
    // TODO: Refresh sessions list after saving
    // fetchSessions().then(data => setSessions(data.sessions));
  };

  const handleDateChange = (date) => {
    paLogger.info('Date filter changed', { date });
    setSelectedDate(date);
    console.log('Date selected:', date);
    // TODO: Filter sessions based on selected date or fetch from API
    // Example API call:
    // fetchSessions(date).then(data => setSessions(data.sessions));
  };

  const handleViewDetails = (sessionId) => {
    paLogger.info('View session details', { sessionId });
    setSelectedSessionId(sessionId);
  };

  const handleCloseDetails = () => {
    paLogger.info('Session details closed');
    setSelectedSessionId(null);
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="physical-assessment">
      <div className="physical-assessment__header">
        <h2 className="physical-assessment__title">Physical Assessment</h2>
      </div>

      {!isAddingSession && (
        <div className="physical-assessment__actions">
          <button
            type="button"
            className="physical-assessment__button physical-assessment__button--add"
            onClick={handleAddSession}
          >
            <span className="physical-assessment__button-icon">+</span>
            Add Session
          </button>
        </div>
      )}
      
      <div className="physical-assessment__content">
        {isAddingSession ? (
          <AddSession 
            onCancel={handleCancelAdd}
            onSave={handleSaveSession}
          />
        ) : selectedSession ? (
          <SessionDetails session={selectedSession} onBack={handleCloseDetails} />
        ) : (
          <>
            {/* Header with label and date picker */}
            <div className="physical-assessment__content-header">
              <h3 className="physical-assessment__content-label">Past Sessions</h3>
              <CustomDatePicker
                value={selectedDate}
                onChange={handleDateChange}
                placeholder="Filter by date"
              />
            </div>

            {/* Past sessions list */}
            <div className="physical-assessment__sessions">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="physical-assessment__session-card">
                    <div className="physical-assessment__session-info">
                      <div className="physical-assessment__session-field">
                        <span className="physical-assessment__session-label">Date</span>
                        <span className="physical-assessment__session-value">
                          {formatDisplayDate(session.date)}
                        </span>
                      </div>
                      <div className="physical-assessment__session-field">
                        <span className="physical-assessment__session-label">No. of Attendees</span>
                        <span className="physical-assessment__session-value">{session.attendees}</span>
                      </div>
                      <div className="physical-assessment__session-field">
                        <span className="physical-assessment__session-label">Coach</span>
                        <span className="physical-assessment__session-value">{session.coach}</span>
                      </div>
                    </div>
                    <button 
                      className="physical-assessment__session-action"
                      onClick={() => handleViewDetails(session.id)}
                    >
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <p className="physical-assessment__placeholder">
                  No sessions found. Click "Add Session" to create a new one.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
