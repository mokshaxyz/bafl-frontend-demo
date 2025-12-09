import React, { useState, useEffect } from 'react';
import './AttendanceViewEdit.css';
import AttendanceDatePicker from './UI/AttendanceDatePicker';
import AttendanceToggleButton from './UI/AttendanceToggleButton';
import AttendancePrimaryButton from './UI/AttendancePrimaryButton';
import AttendanceSecondaryButton from './UI/AttendanceSecondaryButton';
import AttendanceSchoolSelector from './UI/AttendanceSchoolSelector';
import api from '../../services/api';

const AttendanceViewEdit = () => {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter state
  const [attendanceType, setAttendanceType] = useState('student');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // View state
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [originalAttendance, setOriginalAttendance] = useState({});
  const [displayRecords, setDisplayRecords] = useState([]);
  const [loadedSchoolId, setLoadedSchoolId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Button enable logic
  const isLoadButtonEnabled = !isLoading && (
    attendanceType === 'coach' 
      ? (selectedSchool && selectedDate) 
      : (selectedSchool && selectedDate)
  );

  // Handle Load Attendance button click
  const handleLoadAttendance = async () => {
    setIsLoaded(false);
    setIsLoading(true);

    try {
      if (attendanceType === 'coach') {
        // COACH FLOW
        if (!selectedSchoolId) {
          console.error('Coach attendance: school_id is required');
          alert('Please select a school.');
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }
        if (!selectedDate?.trim()) {
          console.error('Coach attendance: date is required');
          alert('Please select a date.');
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }

        const params = {
          type: 'coach',
          school_id: selectedSchoolId,
          date: selectedDate?.trim(),
        };
        console.log('VIEW ATTENDANCE PARAMS (COACH):', params);

        const response = await api.get('/attendance/view', { params });
        console.log('ATTENDANCE VIEW RESPONSE (COACH):', response.data);

        const sessionData = response.data;
        const sessionIdFound = sessionData.session_id || sessionData.id;

        if (!sessionIdFound) {
          console.error('Backend returned no session_id:', sessionData);
          setDisplayRecords([]);
          alert('Invalid session data received from backend.');
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }

        setSessionId(sessionIdFound);

        const records = sessionData.records || [];
        if (!Array.isArray(records) || records.length === 0) {
          setDisplayRecords([]);
          alert('No coach attendance found for the selected filters.');
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }

        // Normalize coach data (allow fallback id when coach_id is null)
        const initialAttendance = {};
        const normalized = records.map((c) => {
          const id = c.coach_id ?? c.coach_name;  // fallback to string label
          const name = c.coach_name || c.coachName || c.name || "Unknown Coach";
          const status = c.status || "Present";
          initialAttendance[id] = status;
          return { id, name, status };
        });

        setDisplayRecords(normalized);
        setAttendance(initialAttendance);
        setOriginalAttendance({ ...initialAttendance });
        setIsLoaded(true);
        setIsEditMode(false);
        return;
      } else {
        // STUDENT FLOW
        if (!selectedSchool || !selectedDate) {
          console.error('Student attendance missing fields:', {
            selectedSchool,
            selectedDate,
          });
          alert('Please select a school and date.');
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }

        // Use school_id if available, otherwise query /students/ to infer it
        let schoolId = selectedSchoolId;

        if (!schoolId) {
          try {
            const studs = await api.get('/students/');
            const all = Array.isArray(studs.data) ? studs.data : (studs.data?.students || []);

            for (const s of all) {
              const sName = s.school || s.school_name || s.schoolName || '';
              if (sName && String(sName).toLowerCase() === String(selectedSchool).toLowerCase()) {
                schoolId = s.school_id || s.schoolId;
                break;
              }
            }

            if (!schoolId) {
              console.error('Failed to resolve school_id', {
                schoolName: selectedSchool,
              });
              alert('Could not resolve school ID. Please ensure selection is valid.');
              setIsLoaded(true);
              setIsLoading(false);
              return;
            }

            setSelectedSchoolId(schoolId);
          } catch (err) {
            console.error('Failed to fetch students for ID resolution', err);
            alert('Failed to load school information.');
            setIsLoaded(true);
            setIsLoading(false);
            return;
          }
        }

        const params = {
          type: 'student',
          date: selectedDate?.trim(),
          school_id: schoolId,
        };

        console.log('VIEW ATTENDANCE PARAMS:', params);

        const viewRes = await api.get('/attendance/view', { params });
        console.log('ATTENDANCE VIEW RESPONSE:', viewRes.data);

        const sessionData = viewRes.data;
        const sessionIdFound = sessionData.session_id || sessionData.id;

        if (!sessionIdFound) {
          console.error('Backend returned no session_id:', sessionData);
          alert('Invalid session data received from backend.');
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }

        setSessionId(sessionIdFound);

        if (!sessionData.records || sessionData.records.length === 0) {
          setDisplayRecords([]);
          alert('No attendance sessions found for the selected filters.');
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }

        const records = sessionData.records || [];
        const initialAttendance = {};
        const normalized = records.map((r) => {
          const id = r.id || r.student_id || r.studentId || r._id;
          const name = r.name || r.student_name || r.full_name || '';
          const status = r.status || r.attendance_status || 'Present';
          if (id != null) initialAttendance[id] = status;
          return { id, name, status };
        }).filter((r) => r.id != null);

        setLoadedSchoolId(schoolId);
        setDisplayRecords(normalized);
        setAttendance(initialAttendance);
        setOriginalAttendance({ ...initialAttendance });
        setIsLoaded(true);
        setIsEditMode(false);
      }
    } catch (err) {
      console.error('Failed to load attendance', err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 401) {
        alert('Credentials invalid — please log in again.');
      } else if (status === 422) {
        alert(data?.detail || data?.message || 'Validation failed — check your inputs.');
      } else {
        alert(data?.detail || data?.message || err?.message || 'Failed to load attendance. Please try again.');
      }

      console.error('Error Status:', status);
      console.error('Error Data:', data);
      setIsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status change (only when in edit mode)
  const handleStatusChange = (recordId, newStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [recordId]: newStatus,
    }));
  };

  // Handle Edit button click
  const handleEdit = () => {
    setIsEditMode(true);
  };

  // Handle Save Changes
  const handleSaveChanges = async () => {
    if (!selectedDate) {
      alert('Please load a session first.');
      return;
    }

    setIsLoading(true);

    try {
      if (attendanceType === 'coach') {
        // Coach attendance is view-only
        alert('Coach attendance cannot be edited. View only.');
        return;
      } else {
        // Save student attendance
        if (!sessionId) {
          alert('No session loaded. Please load attendance first.');
          setIsLoading(false);
          return;
        }

        const records = displayRecords.map((record) => ({
          id: record.id,
          status: attendance[record.id] || 'Present',
        }));

        const payload = {
          records,
        };

        console.log('FINAL EDIT PAYLOAD:', payload);
        console.log('Using PUT to update session:', sessionId);

        const res = await api.put(`/attendance/student/${sessionId}`, payload);
        console.log('Student save response:', res.data);
        alert(res.data?.message || `Attendance updated for ${selectedDate}.`);
        setIsEditMode(false);
        setOriginalAttendance({ ...attendance });
      }
    } catch (err) {
      console.error('Failed to save attendance', err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      console.error('Error Status:', status);
      console.error('Error Response Data:', data);

      if (status === 401) {
        alert('Credentials invalid — please log in again.');
      } else if (status === 422) {
        alert(data?.detail || data?.message || 'Validation failed — check your inputs.');
      } else if (status === 500) {
        alert(data?.detail || data?.message || 'Server error — please try again later.');
      } else {
        alert(data?.detail || data?.message || err?.message || 'Failed to save attendance. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Cancel (revert to original data)
  const handleCancel = () => {
    setAttendance({ ...originalAttendance });
    setIsEditMode(false);
  };

  return (
    <div className="attendance-view-edit">
      <div className="attendance-view-edit__container">
        {/* Header Section */}
        <div className="attendance-view-edit__header">
          <div className="attendance-view-edit__left-section">
            <h2 className="attendance-view-edit__title">View & Edit Attendance</h2>
          </div>
        </div>

        {/* Filter Section */}
        <div className="attendance-view-edit__filter-section">
          {/* Attendance Type Toggle */}
          <div className="attendance-view-edit__type-toggle">
            <button
              className={`attendance-view-edit__toggle-btn ${attendanceType === 'student' ? 'attendance-view-edit__toggle-btn--active' : ''}`}
              onClick={() => {
                setAttendanceType('student');
                setIsLoaded(false);
              }}
            >
              Student Attendance
            </button>
            <button
              className={`attendance-view-edit__toggle-btn ${attendanceType === 'coach' ? 'attendance-view-edit__toggle-btn--active' : ''}`}
              onClick={() => {
                setAttendanceType('coach');
                setIsLoaded(false);
              }}
            >
              Coach Attendance
            </button>
          </div>

          <div className="attendance-view-edit__filter-header">
            <h3 className="attendance-view-edit__filter-title">Filters</h3>
          </div>

          <div className="attendance-view-edit__filter-fields">
            {/* School Selector (show for both Student and Coach) */}
            {(attendanceType === 'student' || attendanceType === 'coach') && (
              <div className="attendance-view-edit__filter-field">
                <AttendanceSchoolSelector
                  selectedSchool={selectedSchool}
                  onSchoolChange={(schoolName, schoolId) => {
                    setSelectedSchool(schoolName);
                    setSelectedSchoolId(schoolId);
                  }}
                  label="School"
                />
              </div>
            )}

            {/* Date Picker */}
            <div className="attendance-view-edit__filter-field">
              <AttendanceDatePicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                label="Date"
              />
            </div>
          </div>

          {/* Load Attendance Button */}
          <div className="attendance-view-edit__filter-actions">
            <AttendancePrimaryButton
              label={isLoading ? 'Loading...' : 'Load Attendance'}
              onClick={handleLoadAttendance}
              disabled={!isLoadButtonEnabled}
            />
          </div>
        </div>

        {/* Attendance Table Section (shown after load) */}
        {isLoaded && displayRecords.length > 0 && (
          <>
            <div className="attendance-view-edit__table-section">
              <div className="attendance-view-edit__table-header">
                <h3 className="attendance-view-edit__table-title">
                  {attendanceType === 'student' ? 'Students' : 'Coaches'}
                </h3>
              </div>

              <table className="attendance-view-edit__table">
                <thead className="attendance-view-edit__table-head">
                  <tr>
                    <th className="attendance-view-edit__table-header attendance-view-edit__table-header--name">
                      Name
                    </th>
                    <th className="attendance-view-edit__table-header attendance-view-edit__table-header--status">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="attendance-view-edit__table-body">
                  {displayRecords.map((record) => (
                    <tr key={record.id} className="attendance-view-edit__table-row">
                      <td className="attendance-view-edit__table-cell attendance-view-edit__table-cell--name">
                        {record.name}
                      </td>
                      <td className="attendance-view-edit__table-cell attendance-view-edit__table-cell--status">
                        {isEditMode ? (
                          <AttendanceToggleButton
                            status={attendance[record.id] || 'Present'}
                            studentId={record.id}
                            onStatusChange={handleStatusChange}
                          />
                        ) : (
                          <div className="attendance-view-edit__status-display">
                            {attendance[record.id] || 'Present'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons Section */}
            <div className="attendance-view-edit__actions">
              {!isEditMode && attendanceType === 'student' && (
                <AttendancePrimaryButton
                  label="Edit"
                  onClick={handleEdit}
                />
              )}
              {isEditMode && attendanceType === 'student' && (
                <>
                  <AttendancePrimaryButton
                    label={isLoading ? 'Saving...' : 'Save Changes'}
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                  />
                  <AttendanceSecondaryButton
                    label="Cancel"
                    onClick={handleCancel}
                    disabled={isLoading}
                  />
                </>
              )}
            </div>
          </>
        )}

        {/* No Records Message */}
        {isLoaded && displayRecords.length === 0 && (
          <div className="attendance-view-edit__no-records">
            <p>No attendance found for selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceViewEdit;
