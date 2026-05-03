'use client';

import dynamic from 'next/dynamic';

const SceneRouter = dynamic(() => import('@/game/ui/SceneRouter'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ff4400',
      fontFamily: 'monospace',
      gap: '1rem',
    }}>
      <div style={{ fontSize: '1.5rem', letterSpacing: '0.3em' }}>
        THE NOTE: APOCALYPSE
      </div>
      <div style={{ fontSize: '0.8rem', color: '#666' }}>
        Loading...
      </div>
    </div>
  ),
});

export default function Home() {
  return <SceneRouter />;
}
