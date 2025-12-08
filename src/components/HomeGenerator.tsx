import { useState } from 'react';
import { apiService } from '../services/api';
import type { HomeGenerationResponse } from '../types/home';

interface HomeGeneratorProps {
  onGenerationSuccess: (response: HomeGenerationResponse) => void;
}

const EXAMPLE_PROMPTS = [
  '2BHK apartment with open kitchen and one balcony',
  '3BHK modern house with home office and dining room',
  'Studio apartment with compact kitchen and bathroom',
  'Large 4BHK villa with separate dining and living areas'
];

export function HomeGenerator({ onGenerationSuccess }: HomeGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      setProgress('Generating floor plan with AI...');
      const response = await apiService.generateHome(prompt.trim());
      
      if (response.success) {
        setProgress('Floor plan generated successfully!');
        setTimeout(() => {
          onGenerationSuccess(response);
        }, 500);
      } else {
        throw new Error(response.error || 'Generation failed');
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate home design');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleUseExample = (example: string) => {
    setPrompt(example);
    setError(null);
  };

  return (
    <div style={{
      padding: 30,
      background: 'rgba(139, 92, 246, 0.05)',
      borderRadius: 16,
      border: '1px solid rgba(139, 92, 246, 0.2)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 24 }}>🏠</span>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#a78bfa',
          margin: 0,
        }}>
          AI Home Generator
        </h3>
      </div>

      <p style={{
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 20,
        lineHeight: 1.6
      }}>
        Describe your dream home in natural language, and our AI will generate a complete floor plan
        with 2D visualization and fully furnished 3D model.
      </p>

      {/* Prompt input */}
      <div style={{ marginBottom: 20 }}>
        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: '#a78bfa',
          marginBottom: 8
        }}>
          Describe Your Home
        </label>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 2BHK apartment with open kitchen, one balcony, modern style"
          disabled={loading}
          style={{
            width: '100%',
            minHeight: 120,
            padding: 15,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 8,
            color: '#ffffff',
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
          }}
        />
      </div>

      {/* Example prompts */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(167, 139, 250, 0.8)',
          marginBottom: 10
        }}>
          💡 Try these examples:
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 8
        }}>
          {EXAMPLE_PROMPTS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleUseExample(example)}
              disabled={loading}
              style={{
                padding: '8px 12px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: 6,
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 12,
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          padding: 12,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 8,
          color: '#fca5a5',
          fontSize: 14,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Progress message */}
      {loading && progress && (
        <div style={{
          padding: 12,
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 8,
          color: '#93c5fd',
          fontSize: 14,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <div style={{
            width: 16,
            height: 16,
            border: '2px solid rgba(147, 197, 253, 0.3)',
            borderTop: '2px solid #93c5fd',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span>{progress}</span>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: loading || !prompt.trim()
            ? 'rgba(139, 92, 246, 0.3)'
            : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          border: 'none',
          borderRadius: 8,
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 700,
          cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'all 0.2s',
          opacity: loading || !prompt.trim() ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (!loading && prompt.trim()) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: 20,
              height: 20,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <span>🎨</span>
            <span>Generate Home Design</span>
          </>
        )}
      </button>

      {/* CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
