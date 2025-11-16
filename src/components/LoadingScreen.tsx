import { Html } from '@react-three/drei';

export function LoadingScreen() {
  return (
    <Html center>
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '30px 50px',
          borderRadius: 16,
          color: 'white',
          fontSize: 20,
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <div style={{ marginBottom: 15, textAlign: 'center' }}>
          Loading 3D Model...
        </div>
        <div
          style={{
            width: 200,
            height: 6,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              animation: 'loading 1.5s ease-in-out infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </Html>
  );
}