import React, { useState, useEffect, useRef } from 'react';
import './PhysicalAssessmentReport.css';
import api from '../../../services/api';
import logger from '../../../utils/logger';
import AttendanceSchoolSelector from '../../Attendance/UI/AttendanceSchoolSelector';
import DynamicBatchSelector from './DynamicBatchSelector';
import AttendanceDatePicker from '../../Attendance/UI/AttendanceDatePicker';
import AttendancePrimaryButton from '../../Attendance/UI/AttendancePrimaryButton';
import { generateDummySessions } from './dummyData';

const reportLogger = logger.createChildLogger('PhysicalAssessmentReport');

// ========== FRONTEND-ONLY ANALYTICS ENGINE ==========
const computeAnalytics = (resultsArray) => {
  if (!resultsArray || resultsArray.length === 0) {
    return null;
  }

  const exercises = ['curl_up', 'push_up', 'sit_and_reach', 'walk_600m', 'dash_50m', 'bow_hold', 'plank'];

  // Calculate student averages
  const studentAverages = resultsArray.map((student) => {
    const values = exercises
      .map(ex => student[ex])
      .filter(val => val !== undefined && val !== null);
    
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    
    return {
      student_id: student.student_id,
      name: student.name,
      average: avg
    };
  });

  // Session average
  const sessionAverage = studentAverages.length > 0 
    ? studentAverages.reduce((sum, s) => sum + s.average, 0) / studentAverages.length
    : 0;

  // Best and weakest students
  const sortedByAvg = [...studentAverages].sort((a, b) => b.average - a.average);
  const bestStudent = sortedByAvg[0] || null;
  const weakestStudent = sortedByAvg[sortedByAvg.length - 1] || null;
  const top3Best = sortedByAvg.slice(0, 3);
  const top3Worst = sortedByAvg.slice(-3).reverse();

  // Exercise averages
  const exerciseAverages = {};
  exercises.forEach((ex) => {
    const values = resultsArray
      .map(s => s[ex])
      .filter(val => val !== undefined && val !== null);
    exerciseAverages[ex] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  });

  // Best and weakest exercises
  const exercisesSorted = Object.entries(exerciseAverages).sort((a, b) => b[1] - a[1]);
  const bestExercise = exercisesSorted.length > 0 
    ? { exercise_name: exercisesSorted[0][0], average: exercisesSorted[0][1] }
    : null;
  const weakestExercise = exercisesSorted.length > 0
    ? { exercise_name: exercisesSorted[exercisesSorted.length - 1][0], average: exercisesSorted[exercisesSorted.length - 1][1] }
    : null;

  return {
    session_count: 1,
    student_count: resultsArray.length,
    session_average: sessionAverage,
    best_student: bestStudent,
    weakest_student: weakestStudent,
    top_3_best: top3Best,
    top_3_worst: top3Worst,
    exercise_averages: exerciseAverages,
    best_exercise: bestExercise,
    weakest_exercise: weakestExercise,
    students: studentAverages
  };
};

const PhysicalAssessmentReport = () => {
  // ========== FILTER STATE ==========
  const [school, setSchool] = useState('');
  const [schoolId, setSchoolId] = useState(null);
  const [batch, setBatch] = useState('');
  const [batchId, setBatchId] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ========== BACKEND DATA STATE ==========
  const [allBatches, setAllBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // ========== FRONTEND SESSIONS STATE ==========
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  // ========== REPORT STATE ==========
  const [analytics, setAnalytics] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  // ========== PDF REF ==========
  const reportRef = useRef(null);

  // ========== LOAD ALL BATCHES ON MOUNT ==========
  useEffect(() => {
    const loadBatches = async () => {
      try {
        setBatchesLoading(true);
        const response = await api.get('/batches/');
        const batches = Array.isArray(response.data) ? response.data : response.data?.batches || [];
        reportLogger.info('Batches loaded', { count: batches.length });
        setAllBatches(batches);
      } catch (err) {
        reportLogger.error('Failed to load batches', err);
        setAllBatches([]);
      } finally {
        setBatchesLoading(false);
      }
    };
    loadBatches();
  }, []);

  // ========== FILTER BATCHES WHEN SCHOOL CHANGES ==========
  useEffect(() => {
    if (schoolId && allBatches.length > 0) {
      const filtered = allBatches.filter(b => b.school_id === schoolId);
      reportLogger.info('Batches filtered by school', { schoolId, count: filtered.length });
      setFilteredBatches(filtered);
      setBatch('');
      setBatchId(null);
      setSessions([]);
      setSelectedSessionId(null);
      setShowSummary(false);
    } else {
      setFilteredBatches([]);
      setBatch('');
      setBatchId(null);
      setSessions([]);
      setSelectedSessionId(null);
      setShowSummary(false);
    }
  }, [schoolId, allBatches]);

  // ========== LOAD STUDENTS WHEN BATCH CHANGES ==========
  useEffect(() => {
    if (schoolId && batchId) {
      const loadStudents = async () => {
        try {
          setStudentsLoading(true);
          const response = await api.get('/students/', {
            params: {
              school_id: schoolId,
              batch_id: batchId
            }
          });
          const studentsData = Array.isArray(response.data) ? response.data : response.data?.students || [];
          reportLogger.info('Students loaded', { count: studentsData.length, batchId });
          setStudents(studentsData);
        } catch (err) {
          reportLogger.error('Failed to load students', err);
          setStudents([]);
        } finally {
          setStudentsLoading(false);
        }
      };
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [schoolId, batchId]);

  // ========== LOAD SESSIONS ==========
  const handleLoadSessions = () => {
    if (!fromDate || !toDate) {
      setReportError('Please select date range');
      return;
    }

    if (!students || students.length === 0) {
      setReportError('No students found for selected batch');
      return;
    }

    try {
      const generatedSessions = generateDummySessions(students, fromDate, toDate);

      reportLogger.info('Sessions generated', { count: generatedSessions.length });
      setSessions(generatedSessions);
      setSelectedSessionId(null);
      setShowSummary(false);
      setAnalytics(null);
      setReportError(null);
    } catch (err) {
      reportLogger.error('Failed to generate sessions', err);
      setReportError('Failed to generate sessions');
    }
  };

  // ========== GENERATE REPORT ==========
  const handleGenerateReport = () => {
    setReportLoading(true);
    setReportError(null);

    try {
      let resultsToAnalyze = [];

      if (showSummary) {
        // Combine results from all sessions
        resultsToAnalyze = sessions.flatMap(s => s.results);
      } else if (selectedSessionId) {
        // Get results from selected session
        const session = sessions.find(s => s.session_id === selectedSessionId);
        if (!session) {
          setReportError('Selected session not found');
          setReportLoading(false);
          return;
        }
        resultsToAnalyze = session.results;
      } else {
        setReportError('Please select a session or summary option');
        setReportLoading(false);
        return;
      }

      // Compute analytics on frontend
      const computedAnalytics = computeAnalytics(resultsToAnalyze);
      
      if (showSummary) {
        computedAnalytics.session_count = sessions.length;
      }

      reportLogger.info('Analytics computed', { 
        avg: computedAnalytics.session_average,
        students: computedAnalytics.student_count 
      });
      setAnalytics(computedAnalytics);
    } catch (err) {
      reportLogger.error('Failed to generate report', err);
      setReportError('Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  // ========== EXPORT TO PDF ==========
  const handleExportPDF = async () => {
    if (!reportRef.current) {
      alert('Report content not found');
      return;
    }

    try {
      // Dynamically import jsPDF and html2canvas
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yPosition = 10;
      let remainingHeight = imgHeight;

      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);

      while (remainingHeight > pageHeight - 20) {
        yPosition += pageHeight - 20;
        remainingHeight -= pageHeight - 20;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, -yPosition, imgWidth, imgHeight);
      }

      pdf.save('Physical_Assessment_Report.pdf');
      reportLogger.info('PDF exported successfully');
    } catch (err) {
      reportLogger.error('Failed to export PDF', err);
      alert('Failed to export PDF');
    }
  };

  // ========== FORMAT DATE FOR DISPLAY ==========
  const formatSessionDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ========== RENDER ==========
  return (
    <div className="physical-assessment-report">
      <div className="physical-assessment-report__container">
        <div className="physical-assessment-report__header">
          <h2 className="physical-assessment-report__title">Physical Assessment Report</h2>
        </div>

        {/* ========== FILTERS SECTION ========== */}
        <div className="physical-assessment-report__filters-card">
          <div className="physical-assessment-report__filters-row">
            <div className="physical-assessment-report__field">
              <label className="physical-assessment-report__label">School</label>
              <AttendanceSchoolSelector
                selectedSchool={school}
                onSchoolChange={(schoolName, schoolIdFromSelector) => {
                  setSchool(schoolName);
                  setSchoolId(schoolIdFromSelector || null);
                }}
                label=""
              />
            </div>

            <div className="physical-assessment-report__field">
              <label className="physical-assessment-report__label">Batch</label>
              <DynamicBatchSelector
                selectedBatchId={batchId}
                onBatchChange={(batchName, batchIdFromSelector) => {
                  setBatch(batchName);
                  setBatchId(batchIdFromSelector);
                }}
                batches={filteredBatches}
                loading={batchesLoading}
                label=""
              />
            </div>
          </div>

          <div className="physical-assessment-report__filters-row">
            <div className="physical-assessment-report__field">
              <label className="physical-assessment-report__label">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="physical-assessment-report__input"
              />
            </div>

            <div className="physical-assessment-report__field">
              <label className="physical-assessment-report__label">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="physical-assessment-report__input"
              />
            </div>

            <div className="physical-assessment-report__field">
              <label>&nbsp;</label>
              <AttendancePrimaryButton
                label="Load Sessions"
                onClick={handleLoadSessions}
                disabled={reportLoading || !schoolId || !batchId || !fromDate || !toDate}
              />
            </div>
          </div>

          {reportError && (
            <div className="physical-assessment-report__error">
              {reportError}
            </div>
          )}
        </div>

        {/* ========== SESSIONS SELECTION ========== */}
        {sessions.length > 0 && (
          <div className="physical-assessment-report__sessions-card">
            <div className="physical-assessment-report__section-title">Select Session</div>
            <div className="physical-assessment-report__sessions-list">
              {sessions.map((session, idx) => (
                <label key={session.session_id} className="physical-assessment-report__radio-label">
                  <input
                    type="radio"
                    name="session"
                    value={session.session_id}
                    checked={selectedSessionId === session.session_id && !showSummary}
                    onChange={() => {
                      setSelectedSessionId(session.session_id);
                      setShowSummary(false);
                      setAnalytics(null);
                    }}
                  />
                  <span className="physical-assessment-report__radio-text">
                    Session {idx + 1} — {formatSessionDate(session.date)}
                  </span>
                </label>
              ))}
              <label className="physical-assessment-report__radio-label">
                <input
                  type="radio"
                  name="session"
                  checked={showSummary}
                  onChange={() => {
                    setShowSummary(true);
                    setSelectedSessionId(null);
                    setAnalytics(null);
                  }}
                />
                <span className="physical-assessment-report__radio-text">Summary of All Sessions</span>
              </label>
            </div>

            <div className="physical-assessment-report__report-actions">
              <AttendancePrimaryButton
                label="Generate Report"
                onClick={handleGenerateReport}
                disabled={reportLoading || (!selectedSessionId && !showSummary)}
              />
            </div>
          </div>
        )}

        {/* ========== REPORT LOADING ========== */}
        {reportLoading && (
          <div className="physical-assessment-report__loading">
            Generating report...
          </div>
        )}

        {/* ========== REPORT CONTENT ========== */}
        {!reportLoading && analytics && (
          <div ref={reportRef} className="physical-assessment-report__report">
            <div className="physical-assessment-report__report-header">
              <h3 className="physical-assessment-report__report-title">
                Physical Assessment Report
              </h3>
              <p className="physical-assessment-report__report-subtitle">
                {school && batch ? `School: ${school} | Batch: ${batch} | ${showSummary ? 'Summary of All Sessions' : `Session: ${formatSessionDate(sessions.find(s => s.session_id === selectedSessionId)?.date)}`}` : 'Assessment Report'}
              </p>
            </div>

            {/* ========== SUMMARY CARDS ========== */}
            <div className="physical-assessment-report__summary-section">
              <h4 className="physical-assessment-report__subsection-title">Overview</h4>
              <div className="physical-assessment-report__summary-cards">
                <div className="physical-assessment-report__card">
                  <div className="physical-assessment-report__card-label">
                    Session Average
                  </div>
                  <div className="physical-assessment-report__card-value">
                    {analytics.session_average ? parseFloat(analytics.session_average).toFixed(2) : 'N/A'}
                  </div>
                </div>

                <div className="physical-assessment-report__card">
                  <div className="physical-assessment-report__card-label">
                    Session Count
                  </div>
                  <div className="physical-assessment-report__card-value">
                    {analytics.session_count || 0}
                  </div>
                </div>

                <div className="physical-assessment-report__card">
                  <div className="physical-assessment-report__card-label">
                    Student Count
                  </div>
                  <div className="physical-assessment-report__card-value">
                    {analytics.student_count || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* ========== TOP PERFORMERS ========== */}
            {(analytics.best_student || analytics.top_3_best) && (
              <div className="physical-assessment-report__performers-section">
                <h4 className="physical-assessment-report__subsection-title">Top Performers</h4>
                <div className="physical-assessment-report__performers-grid">
                  {analytics.best_student && (
                    <div className="physical-assessment-report__performer-card best">
                      <div className="physical-assessment-report__performer-label">
                        Best Student
                      </div>
                      <div className="physical-assessment-report__performer-name">
                        {analytics.best_student.name}
                      </div>
                      <div className="physical-assessment-report__performer-score">
                        {parseFloat(analytics.best_student.average).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {analytics.top_3_best && analytics.top_3_best.length > 0 && (
                    <div className="physical-assessment-report__top-list">
                      <div className="physical-assessment-report__top-label">Top 3 Best</div>
                      {analytics.top_3_best.map((student, idx) => (
                        <div key={idx} className="physical-assessment-report__top-item">
                          <span className="physical-assessment-report__top-rank">#{idx + 1}</span>
                          <span className="physical-assessment-report__top-name">{student.name}</span>
                          <span className="physical-assessment-report__top-score">
                            {parseFloat(student.average).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== BOTTOM PERFORMERS ========== */}
            {(analytics.weakest_student || analytics.top_3_worst) && (
              <div className="physical-assessment-report__performers-section">
                <h4 className="physical-assessment-report__subsection-title">Areas for Improvement</h4>
                <div className="physical-assessment-report__performers-grid">
                  {analytics.weakest_student && (
                    <div className="physical-assessment-report__performer-card weakest">
                      <div className="physical-assessment-report__performer-label">
                        Weakest Student
                      </div>
                      <div className="physical-assessment-report__performer-name">
                        {analytics.weakest_student.name}
                      </div>
                      <div className="physical-assessment-report__performer-score">
                        {parseFloat(analytics.weakest_student.average).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {analytics.top_3_worst && analytics.top_3_worst.length > 0 && (
                    <div className="physical-assessment-report__top-list">
                      <div className="physical-assessment-report__top-label">3 Weakest</div>
                      {analytics.top_3_worst.map((student, idx) => (
                        <div key={idx} className="physical-assessment-report__top-item">
                          <span className="physical-assessment-report__top-rank">#{idx + 1}</span>
                          <span className="physical-assessment-report__top-name">{student.name}</span>
                          <span className="physical-assessment-report__top-score">
                            {parseFloat(student.average).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== EXERCISE ANALYSIS ========== */}
            {(analytics.best_exercise || analytics.weakest_exercise) && (
              <div className="physical-assessment-report__exercise-section">
                <h4 className="physical-assessment-report__subsection-title">Exercise Analysis</h4>
                <div className="physical-assessment-report__exercise-comparison">
                  {analytics.best_exercise && (
                    <div className="physical-assessment-report__exercise-card best">
                      <div className="physical-assessment-report__exercise-label">
                        Best Exercise
                      </div>
                      <div className="physical-assessment-report__exercise-name">
                        {analytics.best_exercise.exercise_name}
                      </div>
                      <div className="physical-assessment-report__exercise-score">
                        {parseFloat(analytics.best_exercise.average).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {analytics.weakest_exercise && (
                    <div className="physical-assessment-report__exercise-card weakest">
                      <div className="physical-assessment-report__exercise-label">
                        Weakest Exercise
                      </div>
                      <div className="physical-assessment-report__exercise-name">
                        {analytics.weakest_exercise.exercise_name}
                      </div>
                      <div className="physical-assessment-report__exercise-score">
                        {parseFloat(analytics.weakest_exercise.average).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== EXERCISE AVERAGES TABLE ========== */}
            {analytics.exercise_averages && Object.keys(analytics.exercise_averages).length > 0 && (
              <div className="physical-assessment-report__exercise-table-section">
                <h4 className="physical-assessment-report__subsection-title">Exercise Averages</h4>
                <table className="physical-assessment-report__table">
                  <thead>
                    <tr>
                      <th>Exercise</th>
                      <th>Average Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analytics.exercise_averages).map(([exercise, average]) => (
                      <tr key={exercise}>
                        <td>{exercise.replace(/_/g, ' ').toUpperCase()}</td>
                        <td>{parseFloat(average).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========== STUDENTS TABLE ========== */}
            {analytics.students && analytics.students.length > 0 && (
              <div className="physical-assessment-report__students-table-section">
                <h4 className="physical-assessment-report__subsection-title">Student Scores</h4>
                <table className="physical-assessment-report__table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Average Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.students.map((student, idx) => (
                      <tr key={idx}>
                        <td>{student.name}</td>
                        <td>{parseFloat(student.average).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========== EXPORT PDF BUTTON ========== */}
        {analytics && (
          <div className="physical-assessment-report__export-section">
            <AttendancePrimaryButton
              label="Download PDF"
              onClick={handleExportPDF}
              disabled={reportLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysicalAssessmentReport;
