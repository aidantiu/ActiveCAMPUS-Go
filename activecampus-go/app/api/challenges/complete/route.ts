import { NextRequest, NextResponse } from 'next/server';
import { completeChallenge } from '../../../../lib/firestore-admin';
import { adminAuth } from '../../../../lib/firebase-admin';
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // Get the request body
    const body = await request.json();
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });
    }

    // Complete the challenge
    const result = await completeChallenge(challengeId, uid);

    if (result.success) {
      return NextResponse.json({
        success: true,
        reward: result.reward,
        message: `Challenge ${challengeId} completed successfully`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Challenge ${challengeId} could not be completed`
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error completing challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}