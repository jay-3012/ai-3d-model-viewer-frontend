import type { ModelInfo } from '../types';

interface ControlsOverlayProps {
  modelInfo: ModelInfo | null;
  loading: boolean;
}

export function ControlsOverlay({ modelInfo, loading }: ControlsOverlayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 20,
        bottom: 20,
        padding: '16px 20px',
        background: 'rgba(15, 23, 42, 0.9)',
        color: 'white',
        borderRadius: 12,
        fontSize: 14,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        maxWidth: 350,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 12,
          fontSize: 16,
          color: '#3b82f6',
        }}
      >
        Controls
      </div>
      <div style={{ display: 'grid', gap: 6, lineHeight: 1.6 }}>
        <div>🖱️ <strong>Click canvas</strong> to lock pointer</div>
        <div>⌨️ <strong>WASD / Arrows</strong> to move</div>
        <div>🖱️ <strong>Mouse</strong> to look around</div>
        <div>⌨️ <strong>Space/E</strong> to move up</div>
        <div>⌨️ <strong>Shift/Q</strong> to move down</div>
        <div>⌨️ <strong>ESC</strong> to unlock pointer</div>
      </div>
      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid rgba(59, 130, 246, 0.3)',
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        {loading ? (
          <div>⏳ Loading model...</div>
        ) : modelInfo ? (
          <>
            <div style={{ marginBottom: 6 }}>✓ Model loaded: {modelInfo.name}</div>
            {modelInfo.size && (
              <div>
                📐 Size: {modelInfo.size.x} × {modelInfo.size.y} × {modelInfo.size.z}m
              </div>
            )}
            {modelInfo.vertices && (
              <div>🔺 Vertices: {modelInfo.vertices.toLocaleString()}</div>
            )}
            {modelInfo.triangles && (
              <div>🔷 Triangles: {modelInfo.triangles.toLocaleString()}</div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}