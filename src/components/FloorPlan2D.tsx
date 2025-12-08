import { useState } from 'react';

interface FloorPlan2DProps {
  svgUrl: string;
}

export function FloorPlan2D({ svgUrl }: FloorPlan2DProps) {
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
  const fullSvgUrl = `${API_BASE_URL}${svgUrl}`;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1a1a2e',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Header with controls */}
      <div style={{
        padding: '15px 20px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ fontSize: 20 }}>📐</span>
          <h3 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: '#60a5fa'
          }}>
            2D Floor Plan
          </h3>
        </div>

        {/* Zoom controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <button
            onClick={handleZoomOut}
            style={{
              padding: '6px 12px',
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: 6,
              color: '#60a5fa',
              fontSize: 16,
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            −
          </button>
          
          <span style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.7)',
            minWidth: 60,
            textAlign: 'center'
          }}>
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            style={{
              padding: '6px 12px',
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: 6,
              color: '#60a5fa',
              fontSize: 16,
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            +
          </button>

          <button
            onClick={handleResetZoom}
            style={{
              padding: '6px 12px',
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: 6,
              color: '#60a5fa',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* SVG viewer */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: '#f5f5f5'
      }}>
        {error ? (
          <div style={{
            textAlign: 'center',
            color: '#ef4444',
            padding: 20
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
            <div>Failed to load floor plan</div>
          </div>
        ) : (
          <div style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease',
            background: 'white',
            padding: 20,
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src={fullSvgUrl}
              alt="Floor Plan"
              onError={() => setError(true)}
              style={{
                display: 'block',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
        )}
      </div>

      {/* Info footer */}
      <div style={{
        padding: '10px 20px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center'
      }}>
        💡 Use zoom controls to explore the floor plan in detail
      </div>
    </div>
  );
}
