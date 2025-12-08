import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { TripoGenerator } from './components/TripoGenerator';
import { HomeGenerator } from './components/HomeGenerator';
import { FloorPlan2D } from './components/FloorPlan2D';
import { Viewer3D } from './components/Viewer3D';
import { apiService } from './services/api';
import type { HomeGenerationResponse } from './types/home';

export default function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [homeData, setHomeData] = useState<HomeGenerationResponse | null>(null);
  const [viewMode, setViewMode] = useState<'unfurnished' | 'furnished'>('furnished');
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  useEffect(() => {
    // Check backend connection on mount
    const checkConnection = async () => {
      const result = await apiService.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
      
      if (!result.success) {
        console.error('Backend connection failed:', result.message);
      } else {
        console.log('✓ Backend connected');
      }
    };

    checkConnection();
  }, []);

  const handleUploadSuccess = (url: string) => {
    console.log('Model loaded:', url);
    setModelUrl(url);
    setHomeData(null); // Clear home data when using upload/tripo
    setShowFloorPlan(false);
  };

  const handleHomeGenerationSuccess = (response: HomeGenerationResponse) => {
    console.log('Home generated:', response);
    setHomeData(response);
    setModelUrl(null); // Clear regular model when home is generated
    setShowFloorPlan(true); // Show floor plan by default
  };

  const handleReset = () => {
    setModelUrl(null);
    setHomeData(null);
    setShowFloorPlan(false);
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header hasModel={!!modelUrl || !!homeData} onReset={handleReset} />

      {/* Connection Status Banner */}
      {connectionStatus === 'disconnected' && (
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5',
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ⚠️ Backend server is not responding. Please ensure the backend is running on port 4000.
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Home Generation View (2D + 3D) */}
        {homeData ? (
          <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
            {/* Controls Bar */}
            <div style={{
              padding: '15px 20px',
              background: 'rgba(0, 0, 0, 0.5)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20
            }}>
              <div style={{
                display: 'flex',
                gap: 10
              }}>
                <button
                  onClick={() => setShowFloorPlan(!showFloorPlan)}
                  style={{
                    padding: '8px 16px',
                    background: showFloorPlan ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: showFloorPlan ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 6,
                    color: showFloorPlan ? '#a78bfa' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📐 {showFloorPlan ? 'Hide' : 'Show'} Floor Plan
                </button>

                <div style={{
                  display: 'flex',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => setViewMode('furnished')}
                    style={{
                      padding: '8px 16px',
                      background: viewMode === 'furnished' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      border: 'none',
                      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                      color: viewMode === 'furnished' ? '#60a5fa' : 'rgba(255, 255, 255, 0.6)',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🛋️ Furnished
                  </button>
                  <button
                    onClick={() => setViewMode('unfurnished')}
                    style={{
                      padding: '8px 16px',
                      background: viewMode === 'unfurnished' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      border: 'none',
                      color: viewMode === 'unfurnished' ? '#60a5fa' : 'rgba(255, 255, 255, 0.6)',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🏗️ Unfurnished
                  </button>
                </div>
              </div>

              <div style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                {homeData.data.rooms.length} rooms · {homeData.data.furniture.length} furniture items
              </div>
            </div>

            {/* Views Container */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* 2D Floor Plan */}
              {showFloorPlan && (
                <div style={{ width: '40%', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <FloorPlan2D svgUrl={homeData.plan2D} />
                </div>
              )}

              {/* 3D Model Viewer */}
              <div style={{ flex: 1 }}>
                <Viewer3D 
                  modelUrl={apiService.getModelUrl(
                    viewMode === 'furnished' 
                      ? homeData.furnished3D.replace('/api/models/', '')
                      : homeData.model3D.replace('/api/models/', '')
                  )} 
                />
              </div>
            </div>
          </div>
        ) : modelUrl ? (
          /* Regular Model View (Upload/Tripo) */
          <Viewer3D modelUrl={modelUrl} />
        ) : (
          /* Input View */
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: '40px',
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            }}
          >
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              {/* Home Generator Section */}
              <HomeGenerator onGenerationSuccess={handleHomeGenerationSuccess} />

              {/* Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  margin: '30px 0',
                }}
              >
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>
                  OR
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* AI Generation Section */}
              <TripoGenerator onGenerationSuccess={handleUploadSuccess} />

              {/* Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  margin: '30px 0',
                }}
              >
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>
                  OR
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Upload Section */}
              <div
                style={{
                  padding: 30,
                  background: 'rgba(59, 130, 246, 0.05)',
                  borderRadius: 16,
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontSize: 24 }}>📁</span>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#60a5fa',
                      margin: 0,
                    }}
                  >
                    Upload Your Own Model
                  </h3>
                </div>

                <UploadZone onUploadSuccess={handleUploadSuccess} />
              </div>

              {/* Info Section */}
              <div
                style={{
                  marginTop: 30,
                  padding: 25,
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 15,
                    color: '#60a5fa',
                    fontSize: 16,
                  }}
                >
                  ℹ️ Supported Formats:
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 15,
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <div>
                    <strong style={{ color: '#3b82f6' }}>Direct View:</strong>
                    <br />
                    GLB, GLTF
                  </div>
                  <div>
                    <strong style={{ color: '#8b5cf6' }}>Auto-Convert:</strong>
                    <br />
                    FBX, OBJ, DAE, STL
                  </div>
                  <div>
                    <strong style={{ color: '#06b6d4' }}>Textures:</strong>
                    <br />
                    PNG, JPG, JPEG, WebP
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 15,
                    paddingTop: 15,
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  💡 <strong>Tip:</strong> Upload entire folders with textures for best results. The
                  system will automatically embed textures into your GLB file.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}