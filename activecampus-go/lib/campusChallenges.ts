// Utility module to manage campus challenge data and marker creation
// Keeps the heavy challenge logic out of the MapComponent for clarity.

export type Challenge = {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  reward: number;
};

export const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'test-location',
    title: '🎯 Test Location Quest',
    description: 'Real-time tracking test! Get within 50m to claim this reward.',
    lat: 14.773854,
    lng: 120.978686,
    reward: 100,
  },
  {
    id: 'lagoon',
    title: 'Walk to the Lagoon',
    description: 'Walk to the campus lagoon to earn Campus Energy.',
    lat: 14.5998,
    lng: 121.0112,
    reward: 50,
  },
  {
    id: 'library',
    title: 'Library Loop',
    description: 'Take a stroll around the main library.',
    lat: 14.5993,
    lng: 121.0099,
    reward: 30,
  },
  {
    id: 'gym',
    title: 'Gym Dash',
    description: 'Visit the campus gym to get a quick reward.',
    lat: 14.6000,
    lng: 121.0100,
    reward: 40,
  },
  {
    id: 'cafe',
    title: 'Café Break',
    description: 'Visit the campus café for a refreshing break.',
    lat: 14.5995,
    lng: 121.0105,
    reward: 20,
  },
  {
    id: 'main-gate',
    title: 'Main Gate Visit',
    description: 'Walk to the main entrance gate of PUP.',
    lat: 14.5990,
    lng: 121.0110,
    reward: 25,
  },
  {
    id: 'oval',
    title: 'Oval Track Challenge',
    description: 'Complete a lap around the campus oval.',
    lat: 14.5997,
    lng: 121.0108,
    reward: 60,
  },
  {
    id: 'admin-building',
    title: 'Administration Building',
    description: 'Visit the main administration building.',
    lat: 14.5994,
    lng: 121.0107,
    reward: 35,
  },
  {
    id: 'engineering',
    title: 'Engineering Complex',
    description: 'Explore the engineering department.',
    lat: 14.6001,
    lng: 121.0105,
    reward: 45,
  },
  {
    id: 'chapel',
    title: 'Chapel Serenity',
    description: 'Visit the peaceful campus chapel.',
    lat: 14.5992,
    lng: 121.0113,
    reward: 30,
  },
  {
    id: 'canteen',
    title: 'Canteen Central',
    description: 'Check out the main canteen area.',
    lat: 14.5996,
    lng: 121.0102,
    reward: 25,
  },
  {
    id: 'auditorium',
    title: 'Auditorium Visit',
    description: 'Walk to the main auditorium.',
    lat: 14.5999,
    lng: 121.0114,
    reward: 40,
  },
  {
    id: 'parking',
    title: 'Parking Area Trek',
    description: 'Explore the campus parking area.',
    lat: 14.5991,
    lng: 121.0104,
    reward: 20,
  },
  {
    id: 'quadrangle',
    title: 'Quadrangle Stroll',
    description: 'Walk through the campus quadrangle.',
    lat: 14.5996,
    lng: 121.0109,
    reward: 35,
  },
  {
    id: 'freedom-park',
    title: 'Freedom Park',
    description: 'Visit the historic Freedom Park area.',
    lat: 14.5998,
    lng: 121.0106,
    reward: 50,
  },
  {
    id: 'college-business',
    title: 'College of Business',
    description: 'Check in at the College of Business.',
    lat: 14.5997,
    lng: 121.0103,
    reward: 30,
  }
];

// Small helper that returns a template for an InfoWindow's content as a string.
export const challengeInfoWindowTemplate = (ch: Challenge, prox: boolean, claimed: boolean) => `
  <div style="min-width:220px; font-size:13px; color:#111; background:#fff; padding:12px; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.12); border:1px solid rgba(0,0,0,0.06);">
  <h3 style="margin:0 0 8px 0; font-size:15px; color:#0b2545 !important; font-weight:700;">${ch.title}</h3> 
    <div id="challenge-desc-${ch.id}" style="margin:0 0 8px 0; color:#222 !important; font-size:13px !important; line-height:1.25 !important;">${ch.description}</div>
  <p style="margin:0 0 8px 0; font-weight:600; color:#111 !important;">Reward: ${ch.reward} CE</p>
    <p style="margin:0 0 10px 0; color:${prox ? '#0a0' : '#666'}; font-size:12px;">${prox ? 'Within 50m — You can claim this!' : 'Move within 50 meters to claim.'}</p>
    <div style="display:flex; gap:8px;">
      <button id="claim-${ch.id}" ${(!prox || claimed) ? 'disabled' : ''} style="flex:1;padding:8px 10px;background:${claimed ? '#9CA3AF' : '#2563EB'};color:white;border-radius:6px;border:0;cursor:${claimed ? 'not-allowed' : (!prox ? 'not-allowed' : 'pointer')}; font-weight:600; opacity:${claimed ? 0.7 : (!prox ? 0.65 : 1)};">${claimed ? 'Claimed' : 'Claim Reward'}</button>
    </div>
  </div>`;

// Returns a set of icon configurations for challenge markers using map-icon.png
export const buildChallengeIcons = (google: typeof window.google) => ({
  default: {
    url: '/icons/map-icon.png',
    scaledSize: new google.maps.Size(50, 50),
    anchor: new google.maps.Point(16, 32),
  } as google.maps.Icon,
  nearby: {
    url: '/icons/map-icon.png',
    scaledSize: new google.maps.Size(50, 50),
    anchor: new google.maps.Point(20, 40),
  } as google.maps.Icon,
  claimed: {
    url: '/icons/map-icon.png',
    scaledSize: new google.maps.Size(50, 50),
    anchor: new google.maps.Point(16, 32),
    opacity: 0.5,
  } as google.maps.Icon,
});

// Create markers for provided challenges on the given map and return an id->marker map.
export const createChallengeMarkers = (
  google: typeof window.google,
  map: google.maps.Map,
  challenges: Challenge[] = DEFAULT_CHALLENGES,
  icons?: Record<string, google.maps.Symbol>
) => {
  const markers: Record<string, google.maps.Marker> = {};

  challenges.forEach((ch) => {
    const pos = { lat: ch.lat, lng: ch.lng };
    const marker = new google.maps.Marker({
      position: pos,
      map,
      title: ch.title,
      icon: icons?.default || undefined,
    });

    try {
      (marker as any).set('challengeData', { id: ch.id, title: ch.title, reward: ch.reward });
    } catch (e) {
      // ignore
    }

    // Note: do not attach click handlers or InfoWindows here.
    // The caller (MapComponent) should manage InfoWindow lifecycle and claim logic
    // so that it can access React state (e.g. claimedChallenges, userLocation).

    markers[ch.id] = marker;
  });

  return markers;
};
