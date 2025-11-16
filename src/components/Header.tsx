
interface HeaderProps {
  hasModel: boolean;
  onReset: () => void;
}

export function Header({ hasModel, onReset }: HeaderProps) {
  return (
    <header
      style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 32 }}>🏗️</span>
        <span>AI 3D Viewer</span>
      </div>

      <div style={{ flex: 1 }} />

      {hasModel && (
        <button
          onClick={onReset}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Upload New Model
        </button>
      )}
    </header>
  );
}