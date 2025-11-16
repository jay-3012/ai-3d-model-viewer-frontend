import  { useState } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { Viewer3D } from './components/Viewer3D';

export default function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  const handleReset = () => {
    setModelUrl(null);
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
      }}
    >
      <Header hasModel={!!modelUrl} onReset={handleReset} />

      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!modelUrl ? (
          <UploadZone onUploadSuccess={setModelUrl} />
        ) : (
          <Viewer3D modelUrl={modelUrl} />
        )}
      </main>
    </div>
  );
}