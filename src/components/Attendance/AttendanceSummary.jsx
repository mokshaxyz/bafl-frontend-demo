import React, { useState, useEffect } from 'react';
import './AttendanceSummary.css';
import AttendanceDatePicker from './UI/AttendanceDatePicker';
import AttendancePrimaryButton from './UI/AttendancePrimaryButton';
import AttendanceSchoolSelector from './UI/AttendanceSchoolSelector';
import api from '../../services/api';

const AttendanceSummary = () => {
  // Students fetched from backend
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  const [summaryType, setSummaryType] = useState('student'); // 'student' or 'coach'
  const [school, setSchool] = useState('');
  const [student, setStudent] = useState('All');
  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [summaryData, setSummaryData] = useState(null);

  // Synthetic coach labels based on school
  const getSyntheticCoachLabel = (schoolName) => {
    if (!schoolName) return null;
    const name = String(schoolName).toLowerCase();
    if (name.includes('avasara')) return 'coach_avasara';
    if (name.includes('akanksha')) return 'coach_akschools';
    return null;
  };

  const isGenerateEnabled = school && fromDate && toDate;
  useEffect(() => {
    let mounted = true;
    const loadSchools = async () => {
      try {
        const res = await api.get('/schools/');
        const data = Array.isArray(res.data) ? res.data : (res.data?.schools || []);
        if (mounted) setSchools(data || []);
      } catch (err) {
        console.error('Failed to fetch schools for summary', err);
        setSchools([]);
      }
    };
    loadSchools();
    return () => { mounted = false; };
  }, []);

  // fetch students once on mount
  useEffect(() => {
    let mounted = true;
    const loadStudents = async () => {
      try {
        const res = await api.get('/students/');
        const all = Array.isArray(res.data) ? res.data : (res.data?.students || []);
        if (mounted) setStudents(all);
      } catch (err) {
        console.error('Failed to fetch students for summary', err);
        alert('Failed to load students. Please try again.');
      }
    };
    loadStudents();
    return () => { mounted = false; };
  }, []);

  // resolve selectedSchoolId when school name changes
  useEffect(() => {
    // If we have selectedSchoolId from the selector, use it
    if (selectedSchoolId) {
      return;
    }
    
    // Try to find school in fetched schools
    if (schools && schools.length > 0 && school) {
      const foundSchool = schools.find((s) => String(s.name).toLowerCase() === String(school).toLowerCase());
      if (foundSchool) {
        setSelectedSchoolId(foundSchool.id);
      } else {
        setSelectedSchoolId(null);
      }
    } else if (students && students.length > 0 && school) {
      // Fallback to students data if schools not loaded
      const foundSchool = students.find((s) => {
        const schoolName = s.school || s.school_name || s.schoolName || '';
        return schoolName && String(schoolName).toLowerCase() === String(school).toLowerCase();
      });
      if (foundSchool) {
        setSelectedSchoolId(foundSchool.school_id || foundSchool.schoolId || foundSchool.school || null);
      } else {
        setSelectedSchoolId(null);
      }
    }
  }, [school, students, schools, selectedSchoolId]);

  const handleGenerate = async () => {
    // Block request if IDs missing
    if (!selectedSchoolId || !fromDate || !toDate) {
      alert('Please select School, From Date and To Date before generating summary.');
      return;
    }

    try {
      if (summaryType === 'coach') {
        // Coach summary API call
        const coachLabel = getSyntheticCoachLabel(school);
        if (!coachLabel) {
          alert('Selected school does not have a coach label.');
          return;
        }

        const params = {
          type: 'coach',
          school_id: selectedSchoolId,
          start_date: fromDate,
          end_date: toDate,
        };

        if (coachLabel !== 'All') {
          params.coach_name = coachLabel;
        }

        console.log('Coach Summary PARAMS:', params);

        const res = await api.get('/attendance/summary', { params });
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);

        // Convert coach data to render format
        const rows = data.map((row, idx) => ({
          id: idx,
          name: row.coach_name || row.coachName,
          totalSessions: row.totalSessions,
          present: row.presentDays,
        }));
        setSummaryData(rows);
      } else {
        // Student summary API call (existing logic)
        const params = {
          type: 'student',
          school_id: selectedSchoolId,
          start_date: fromDate,
          end_date: toDate,
        };

        if (student !== 'All') {
          params.studentId = Number(student);
        }

        console.log('Attendance Summary PARAMS:', params);

        const res = await api.get('/attendance/summary', { params });
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);

        // convert to render format
        const rows = data.map((row) => ({
          id: row.studentId,
          name: row.studentName,
          totalSessions: row.totalSessions,
          present: row.presentDays,
          absent: row.absentDays,
          percentage: `${row.percentage}%`,
        }));
        setSummaryData(rows);
      }
    } catch (err) {
      console.error('Failed to load attendance summary', err);
      if (summaryType === 'coach') {
        // For coach, show clean message
        setSummaryData([]);
        alert('No coach attendance found for this range.');
      } else {
        // For student, show general error
        alert(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to load attendance summary.');
      }
    }
  };

  return (
    <div className="attendance-summary">
      <div className="attendance-summary__container">
        <div className="attendance-summary__header">
          <h2 className="attendance-summary__title">Attendance Summary</h2>
        </div>

        <div className="attendance-summary__filters-card">
          {/* Row 1: Summary Type and School */}
          <div className="attendance-summary__filters-row">
            <div className="attendance-summary__field">
              <label className="attendance-summary__label">Summary Type</label>
              <select
                className="attendance-summary__select"
                value={summaryType}
                onChange={(e) => {
                  setSummaryType(e.target.value);
                  setStudent('All');
                  setSummaryData(null);
                }}
              >
                <option value="student">Student</option>
                <option value="coach">Coach</option>
              </select>
            </div>

            <div className="attendance-summary__field">
              <label className="attendance-summary__label">School</label>
              <AttendanceSchoolSelector selectedSchool={school} onSchoolChange={(schoolName, schoolId) => {
                setSchool(schoolName);
                setSelectedSchoolId(schoolId || null);
                setStudent('All');
                setSummaryData(null);
              }} label="" />
            </div>
          </div>

          {/* Row 2: From Date, To Date, Student/Coach Dropdown, Generate Button */}
          <div className="attendance-summary__filters-row">
            <div className="attendance-summary__field">
              <AttendanceDatePicker selectedDate={fromDate} onDateChange={setFromDate} label="From Date" />
            </div>

            <div className="attendance-summary__field">
              <AttendanceDatePicker selectedDate={toDate} onDateChange={setToDate} label="To Date" />
            </div>

            {summaryType === 'student' ? (
              <div className="attendance-summary__field">
                <label className="attendance-summary__label">Student</label>
                <select
                  className="attendance-summary__select"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                >
                  <option value="All">All Students</option>
                  {students
                    .filter((s) => {
                      const schoolMatch = selectedSchoolId ? (s.school_id === selectedSchoolId || s.schoolId === selectedSchoolId) : true;
                      return schoolMatch;
                    })
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="attendance-summary__field">
                <label className="attendance-summary__label">Coach</label>
                <div className="attendance-summary__coach-label">
                  {school && getSyntheticCoachLabel(school)
                    ? getSyntheticCoachLabel(school)
                    : 'Select a school to see coach'}
                </div>
              </div>
            )}

            <div className="attendance-summary__actions">
              <AttendancePrimaryButton label="Generate Summary" onClick={handleGenerate} disabled={!isGenerateEnabled} />
            </div>
          </div>
        </div>

        {summaryData && summaryData.length > 0 && (
          <div className="attendance-summary__table-card">
            <table className="attendance-summary__table">
              <thead>
                <tr>
                  {summaryType === 'student' ? (
                    <>
                      <th>Student Name</th>
                      <th>Total Sessions</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Percentage</th>
                    </>
                  ) : (
                    <>
                      <th>Total Sessions</th>
                      <th>Present Days</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {summaryData.map((r) => (
                  <tr key={r.id}>
                    {summaryType === 'student' ? (
                      <>
                        <td>{r.name}</td>
                        <td>{r.totalSessions}</td>
                        <td>{r.present}</td>
                        <td>{r.absent}</td>
                        <td>{r.percentage}</td>
                      </>
                    ) : (
                      <>
                        <td>{r.totalSessions}</td>
                        <td>{r.present}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {summaryData && summaryData.length === 0 && (
          <div className="attendance-summary__no-data">
            <p>No {summaryType} summary found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceSummary;
