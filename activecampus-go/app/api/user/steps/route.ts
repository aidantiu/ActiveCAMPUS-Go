import { NextRequest, NextResponse } from 'next/server';
import { updateUserSteps } from '../../../../lib/firestore-admin';
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
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // Get the request body
    const body = await request.json();
    const { steps } = body;

    if (typeof steps !== 'number' || steps <= 0) {
      return NextResponse.json({ error: 'Invalid steps value' }, { status: 400 });
    }

    // Update user steps
    const result = await updateUserSteps(uid, steps);

    if (result) {
      return NextResponse.json({
        success: true,
        earnedCE: result.earnedCE,
        newLevel: result.newLevel,
        message: `Added ${steps} steps, earned ${result.earnedCE} CE`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to update steps'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating steps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}