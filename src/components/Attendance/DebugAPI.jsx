import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DebugAPI = () => {
  const [results, setResults] = useState({});

  useEffect(() => {
    const testAPIs = async () => {
      const testResults = {};

      // Test 1: Schools
      try {
        console.log('Testing /schools/ endpoint...');
        const schoolsRes = await api.get('/schools/');
        testResults.schools = {
          status: 'success',
          statusCode: schoolsRes.status,
          data: schoolsRes.data,
        };
        console.log('Schools success:', schoolsRes.data);
      } catch (err) {
        testResults.schools = {
          status: 'error',
          statusCode: err?.response?.status,
          message: err?.message,
          errorData: err?.response?.data,
        };
        console.error('Schools error:', testResults.schools);
      }

      // Test 2: Students
      try {
        console.log('Testing /students/ endpoint...');
        const studentsRes = await api.get('/students/');
        testResults.students = {
          status: 'success',
          statusCode: studentsRes.status,
          data: studentsRes.data,
        };
        console.log('Students success:', studentsRes.data);
      } catch (err) {
        testResults.students = {
          status: 'error',
          statusCode: err?.response?.status,
          message: err?.message,
          errorData: err?.response?.data,
        };
        console.error('Students error:', testResults.students);
      }

      // Test 3: Check auth token
      const token = localStorage.getItem('access_token');
      testResults.auth = {
        hasToken: !!token,
        tokenLength: token?.length || 0,
      };

      setResults(testResults);
    };

    testAPIs();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h2>API Debug Results</h2>
      <p>Check console for detailed logs</p>
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(results, null, 2)}
      </div>
    </div>
  );
};

export default DebugAPI;
