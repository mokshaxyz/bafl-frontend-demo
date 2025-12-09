/**
 * dummyData.js
 * 
 * Dedicated helper module for generating dummy physical assessment data.
 * Handles session generation, result generation, and date randomization.
 */

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
const getRandomScore = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates a random date string within the given range
 * @param {string} fromDate - Start date (YYYY-MM-DD format)
 * @param {string} toDate - End date (YYYY-MM-DD format)
 * @returns {string} Random date string (YYYY-MM-DD format)
 */
const generateRandomDateInRange = (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const daysDiff = Math.floor((to - from) / (1000 * 60 * 60 * 24));
  const randomDays = Math.floor(Math.random() * daysDiff);
  
  const sessionDate = new Date(from);
  sessionDate.setDate(sessionDate.getDate() + randomDays);
  
  return sessionDate.toISOString().split('T')[0];
};

/**
 * Generates exercise scores for a single student
 * Uses realistic ranges for each exercise:
 * - curl_up: 5-30 repetitions
 * - push_up: 5-25 repetitions
 * - sit_and_reach: 10-30 cm
 * - walk_600m: 150-250 seconds
 * - dash_50m: 7-15 seconds
 * - bow_hold: 10-40 seconds
 * - plank: 15-60 seconds
 * 
 * @param {object} student - Student object with student_id and name
 * @returns {object} Student result object with all exercise scores
 */
const generateDummyResultsForStudent = (student) => {
  return {
    student_id: student.student_id || student.id,
    name: student.name || student.student_name || 'Unknown',
    curl_up: getRandomScore(5, 30),
    push_up: getRandomScore(5, 25),
    sit_and_reach: getRandomScore(10, 30),
    walk_600m: getRandomScore(150, 250),
    dash_50m: getRandomScore(7, 15),
    bow_hold: getRandomScore(10, 40),
    plank: getRandomScore(15, 60)
  };
};

/**
 * Generates multiple dummy sessions with random dates and student results
 * Creates 3-6 sessions distributed across the date range
 * Each session contains results for all provided students
 * 
 * @param {array} students - Array of student objects
 * @param {string} fromDate - Start date (YYYY-MM-DD format)
 * @param {string} toDate - End date (YYYY-MM-DD format)
 * @returns {array} Array of session objects with results
 */
const generateDummySessions = (students, fromDate, toDate) => {
  if (!students || students.length === 0) {
    return [];
  }

  // Generate 3-6 random session dates
  const numSessions = getRandomScore(3, 6);
  const generatedSessions = [];
  
  for (let i = 0; i < numSessions; i++) {
    const dateStr = generateRandomDateInRange(fromDate, toDate);
    
    // Generate results for all students in this session
    const results = students.map(student => generateDummyResultsForStudent(student));

    generatedSessions.push({
      session_id: i + 1,
      date: dateStr,
      results
    });
  }

  // Sort by date
  generatedSessions.sort((a, b) => new Date(a.date) - new Date(b.date));

  return generatedSessions;
};

export { generateDummySessions, generateDummyResultsForStudent, generateRandomDateInRange };
