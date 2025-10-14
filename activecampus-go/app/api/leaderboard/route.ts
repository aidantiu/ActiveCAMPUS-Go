import { NextRequest, NextResponse } from 'next/server';

// Server-side fetch using REST API (doesn't require Admin SDK)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    // Use Firestore REST API to fetch leaderboard
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('Firebase project ID not configured');
    }

    // Construct Firestore REST API URL for querying users collection
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        orderBy: [
          {
            field: { fieldPath: 'campusEnergy' },
            direction: 'DESCENDING'
          }
        ],
        limit: limit
      }
    };

    const response = await fetch(firestoreUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryBody),
    });

    if (!response.ok) {
      throw new Error(`Firestore API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Firestore REST API response to user objects
    const leaderboard = data
      .filter((doc: any) => doc.document)
      .map((doc: any) => {
        const fields = doc.document.fields;
        return {
          uid: fields.uid?.stringValue || '',
          displayName: fields.displayName?.stringValue || 'Anonymous',
          email: fields.email?.stringValue || '',
          school: fields.school?.stringValue || '',
          campusEnergy: parseInt(fields.campusEnergy?.integerValue || '0'),
          completedChallenges: fields.completedChallenges?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
          totalSteps: parseInt(fields.totalSteps?.integerValue || '0'),
          level: parseInt(fields.level?.integerValue || '1'),
        };
      });

    return NextResponse.json({ 
      success: true, 
      leaderboard 
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard', details: String(error) },
      { status: 500 }
    );
  }
}

