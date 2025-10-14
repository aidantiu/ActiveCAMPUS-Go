'use client';

import { useState, useEffect } from 'react';
import { 
  createUser, 
  getUser, 
  updateUserSteps, 
  getLeaderboard,
  getChallenges,
  getActiveDepartmentEvents,
  User 
} from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export default function TestPage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [results, setResults] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Test Firebase connection on load
    testFirebaseConnection();
  }, []);

  const addResult = (test: string, success: boolean, data?: any) => {
    setResults(prev => [...prev, { test, success, data, timestamp: new Date().toISOString() }]);
  };

  const testFirebaseConnection = async () => {
    setStatus('Testing Firebase connection...');
    setResults([]);

    try {
      // Test 1: Anonymous Auth
      setStatus('Test 1: Authenticating anonymously...');
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      setUserId(uid);
      addResult('Anonymous Authentication', true, { uid });

      // Test 2: Create User
      setStatus('Test 2: Creating test user...');
      await createUser(uid, {
        displayName: 'Test Student',
        email: 'test@example.com',
        school: 'Polytechnic University of the Philippines',
      });
      addResult('Create User', true, { uid });

      // Test 3: Get User
      setStatus('Test 3: Fetching user data...');
      const user = await getUser(uid);
      addResult('Get User', !!user, user);

      // Test 4: Update Steps
      setStatus('Test 4: Updating steps (500 steps)...');
      const stepResult = await updateUserSteps(uid, 500);
      addResult('Update Steps', !!stepResult, stepResult);

      // Test 5: Get Updated User
      setStatus('Test 5: Verifying step update...');
      const updatedUser = await getUser(uid);
      addResult('Get Updated User', !!updatedUser, {
        totalSteps: updatedUser?.totalSteps,
        campusEnergy: updatedUser?.campusEnergy,
        level: updatedUser?.level,
      });

      // Test 6: Get Leaderboard
      setStatus('Test 6: Fetching leaderboard...');
      const leaderboard = await getLeaderboard(5);
      addResult('Get Leaderboard', true, { count: leaderboard.length });

      // Test 7: Get Challenges
      setStatus('Test 7: Fetching challenges...');
      const challenges = await getChallenges();
      addResult('Get Challenges', true, { count: challenges.length });

      // Test 8: Get Department Events
      setStatus('Test 8: Fetching department events...');
      const events = await getActiveDepartmentEvents();
      addResult('Get Department Events', true, { count: events.length });

      setStatus('✅ All tests completed!');
    } catch (error: any) {
      setStatus(`❌ Test failed: ${error.message}`);
      addResult('Error', false, { error: error.message, stack: error.stack });
    }
  };

  const testUpdateSteps = async () => {
    if (!userId) {
      alert('Please run initial tests first');
      return;
    }

    setLoading(true);
    try {
      const steps = Math.floor(Math.random() * 1000) + 100;
      const result = await updateUserSteps(userId, steps);
      addResult('Manual Step Update', true, { steps, result });
      
      const updatedUser = await getUser(userId);
      addResult('Verify Update', true, {
        totalSteps: updatedUser?.totalSteps,
        campusEnergy: updatedUser?.campusEnergy,
      });
    } catch (error: any) {
      addResult('Manual Step Update', false, { error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">
            🔥 ActiveCAMPUS GO
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Firebase Connection Test
          </h2>

          {/* Status Bar */}
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded">
            <p className="text-indigo-700 font-medium">{status}</p>
          </div>

          {/* User ID Display */}
          {userId && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
              <p className="text-green-700 font-mono text-sm">
                <strong>User ID:</strong> {userId}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={testFirebaseConnection}
              className="bg-indigo-600 hover:bg-indigo-700 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors"
              disabled={loading}
            >
              🔄 Run All Tests
            </button>
            <button
              onClick={testUpdateSteps}
              className="bg-green-600 hover:bg-green-700 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors"
              disabled={loading || !userId}
            >
              🚶 Test Step Update
            </button>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Test Results:</h3>
            {results.length === 0 ? (
              <p className="text-gray-500 italic">No tests run yet...</p>
            ) : (
              results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.success
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800">
                      {result.success ? '✅' : '❌'} {result.test}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {result.data && (
                    <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">📝 What This Tests:</h4>
            <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
              <li>Firebase Authentication (Anonymous)</li>
              <li>Firestore User Creation</li>
              <li>Reading User Data</li>
              <li>Updating Steps & Calculating CE</li>
              <li>Leaderboard Queries</li>
              <li>Challenge Fetching</li>
              <li>Department Events</li>
            </ul>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
