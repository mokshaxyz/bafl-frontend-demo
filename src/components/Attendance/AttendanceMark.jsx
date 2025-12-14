import React, { useState, useEffect } from 'react';
import './AttendanceMark.css';
import AttendanceDatePicker from './UI/AttendanceDatePicker';
import AttendanceToggleButton from './UI/AttendanceToggleButton';
import AttendancePrimaryButton from './UI/AttendancePrimaryButton';
import AttendanceSchoolSelector from './UI/AttendanceSchoolSelector';
import AttendanceCoachSelector from './UI/AttendanceCoachSelector';
import api from '../../services/api';

const AttendanceMark = () => {
  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Form state for marking attendance
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [markedByCoach, setMarkedByCoach] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // Maps student ID to attendance status
  // Note: This page creates new attendance records only (no sessionId needed)

  // Helper: Map school name to synthetic coach label for request
  const getCoachLabelForSchool = (schoolName) => {
    if (!schoolName) return '';
    const name = String(schoolName).toLowerCase();
    if (name.includes('avasara')) return 'coach_avsara';
    if (name.includes('akanksha')) return 'coach_akschools';
    return '';
  };

  // Load coaches when school changes to verify coaches exist for selected school
  useEffect(() => {
    let cancelled = false;

    const loadCoaches = async () => {
      if (!selectedSchool || !selectedSchoolId) {
        setMarkedByCoach('');
        return;
      }

      try {
        const res = await api.get('/coaches/', {
          params: { school_id: selectedSchoolId }
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.coaches || []);

        if (!cancelled && data.length > 0) {
          // If coaches exist for this school, set the synthetic coach label for API request

          const label = getCoachLabelForSchool(selectedSchool);
          setMarkedByCoach(label || '');
        } else if (!cancelled) {
          setMarkedByCoach('');
        }
      } catch (err) {
        console.error('Failed to load coaches for school', err);
        if (!cancelled) {
          setMarkedByCoach('');
        }
      }
    };

    loadCoaches();

    return () => { cancelled = true; };
  }, [selectedSchool, selectedSchoolId]);

  // Fetch student roster when school and date are selected
  useEffect(() => {
    let cancelled = false;

    const loadStudents = async () => {
      console.log('AttendanceMark: loadStudents called with:', { selectedSchool, selectedDate, selectedSchoolId });
      if (!selectedSchool || !selectedDate || !selectedSchoolId) {
        console.log('AttendanceMark: Missing required fields, skipping student load');
        setStudents([]);
        setAttendance({});
        return;
      }

      try {
        // Query students by school_id
        console.log('AttendanceMark: Fetching students for school_id:', selectedSchoolId);
        const res = await api.get('/students/', { 
          params: { school_id: selectedSchoolId }
        });
        console.log('AttendanceMark: Students response:', res.data);
        const all = Array.isArray(res.data) ? res.data : (res.data?.students || []);
        console.log('AttendanceMark: Parsed students:', all);

        if (cancelled) return;

        // Filter students by school_id
        const filtered = all.filter((s) => {
          const sid = s.school_id || s.schoolId;
          return sid && String(sid) === String(selectedSchoolId);
        }).map((s) => ({ id: s.id || s._id, name: s.name || s.full_name || s.student_name || '' })).filter(s => s.id != null);

        console.log('AttendanceMark: Filtered students:', filtered);
        setStudents(filtered);

        // Initialize attendance mapping
        const initial = {};
        filtered.forEach((st) => { initial[st.id] = 'Present'; });
        setAttendance(initial);
      } catch (err) {
        console.error('AttendanceMark: Failed to load students', err.message, err);
        alert(
          err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to load students. Please try again.'
        );
        setStudents([]);
        setAttendance({});
      }
    };

    loadStudents();

    return () => { cancelled = true; };
  }, [selectedSchool, selectedDate, selectedSchoolId]);

  const handleStatusChange = (studentId, newStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  const handleSaveAttendance = async () => {
    // Validate required fields
    if (!selectedSchool || !selectedDate) {
      console.error('Mark attendance validation failed:', {
        selectedSchool,
        selectedDate,
      });
      alert('Please fill school and date before saving.');
      return;
    }

    // Ensure school ID is available
    if (!selectedSchoolId) {
      console.error('Mark attendance missing school ID:', {
        selectedSchoolId,
      });
      alert('Please ensure school is properly loaded.');
      return;
    }

    const payload = {
      school_id: selectedSchoolId,
      date: selectedDate,
      marked_by_coach: markedByCoach || null,
      records: students.map((student) => ({
        id: student.id,
        status: attendance[student.id] || 'Present',
      })),
    };

    try {
      console.log('FINAL MARK PAYLOAD:', payload);
      const response = await api.post('/attendance/student', payload);
      console.log('Mark attendance response:', response.data);
      alert(response.data?.message || 'Attendance saved successfully');
    } catch (error) {
      console.error('Failed to save attendance', error);
      const status = error?.response?.status;
      const data = error?.response?.data;

      console.error('Error Status:', status);
      console.error('Error Data:', data);
      console.error('Full Payload Sent:', JSON.stringify(payload, null, 2));

      if (status === 401) {
        alert('Credentials invalid — please log in again.');
      } else if (status === 422) {
        alert(data?.detail || data?.message || 'Validation failed — check your inputs.');
      } else if (status === 500) {
        alert(data?.detail || data?.message || 'Server error — please try again later.');
      } else {
        alert(data?.detail || data?.message || error?.message || 'Failed to save attendance. Please try again.');
      }
    }
  };

  return (
    <div className="attendance-mark">
      <div className="attendance-mark__container">
        {/* Header Section */}
        <div className="attendance-mark__header">
          <div className="attendance-mark__left-section">
            <h2 className="attendance-mark__title">Mark Attendance</h2>
          </div>

          {/* School, Date, and Coach Selectors */}
          <div className="attendance-mark__selectors-section">
            <AttendanceSchoolSelector
              selectedSchool={selectedSchool}
              onSchoolChange={(schoolName, schoolId) => {
                console.log('AttendanceMark: School selected:', { schoolName, schoolId });
                setSelectedSchool(schoolName);
                setSelectedSchoolId(schoolId);
              }}
              label="School"
            />
            <AttendanceDatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              label="Date"
            />
            <AttendanceCoachSelector
              selectedCoach={markedByCoach}
              onCoachChange={setMarkedByCoach}
              label="Session Taken By"
              selectedSchool={selectedSchool}
            />
          </div>
        </div>

        {/* Students List Section */}
        <div className="attendance-mark__students-section">
          <div className="attendance-mark__students-header">
            <h3 className="attendance-mark__students-title">Students</h3>
          </div>

          <table className="attendance-mark__table">
            <thead className="attendance-mark__table-head">
              <tr>
                <th className="attendance-mark__table-header attendance-mark__table-header--name">
                  Name
                </th>
                <th className="attendance-mark__table-header attendance-mark__table-header--status">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="attendance-mark__table-body">
              {students.length === 0 ? (
                <tr className="attendance-mark__table-row">
                  <td className="attendance-mark__table-cell" colSpan={2}>
                    No students found for the selected school.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="attendance-mark__table-row">
                    <td className="attendance-mark__table-cell attendance-mark__table-cell--name">
                      {student.name || student.full_name || student.student_name || 'Unnamed Student'}
                    </td>
                    <td className="attendance-mark__table-cell attendance-mark__table-cell--status">
                      <AttendanceToggleButton
                        status={attendance[student.id] || 'Present'}
                        studentId={student.id}
                        onStatusChange={handleStatusChange}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Save Button Section */}
        <div className="attendance-mark__actions">
          <AttendancePrimaryButton
            label="Save Attendance"
            onClick={handleSaveAttendance}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceMark;
