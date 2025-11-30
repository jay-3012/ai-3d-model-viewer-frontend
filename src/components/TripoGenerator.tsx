import React, { useState, useRef } from 'react';
import { apiService } from '../services/api';

interface TripoGeneratorProps {
  onGenerationSuccess: (modelUrl: string) => void;
}

export function TripoGenerator({ onGenerationSuccess }: TripoGeneratorProps) {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<number>(10);

  const pollStatus = async (jobId: string) => {
    try {
      const result = await apiService.getTripoStatus(jobId);
      
      setProgress(result.progress);
      setStatus(`Generating... ${result.progress}%`);

      if (result.status === 'completed' && result.modelUrl) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setStatus('Model ready!');
        setTimeout(() => {
          onGenerationSuccess(result.modelUrl!);
        }, 500);
      } else if (result.status === 'failed') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setError(result.error || 'Generation failed');
        setGenerating(false);
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  const handleTextGeneration = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setGenerating(true);
    setError('');
    setStatus('Starting AI generation...');
    setProgress(0);

    try {
      const result = await apiService.generateFromText(prompt);
      
      if (result.status === 'processing') {
        setStatus('AI is generating your model...');
        
        pollIntervalRef.current = window.setInterval(() => {
          pollStatus(result.jobId);
        }, 3000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      setGenerating(false);
    }
  };

  const handleImageGeneration = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGenerating(true);
    setError('');
    setStatus('Uploading image...');
    setProgress(0);

    try {
      const result = await apiService.generateFromImage(file, undefined, (p) => setProgress(p));
      
      setStatus('AI is generating 3D model from your image...');
      
      pollIntervalRef.current = window.setInterval(() => {
        pollStatus(result.jobId);
      }, 3000);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      setGenerating(false);
    } finally {
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{
      padding: 30,
      background: 'rgba(139, 92, 246, 0.05)',
      borderRadius: 16,
      border: '1px solid rgba(139, 92, 246, 0.2)',
      marginBottom: 30
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20
      }}>
        <span style={{ fontSize: 24 }}>🤖</span>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#a78bfa',
          margin: 0
        }}>
          AI Model Generation (Tripo AI)
        </h3>
      </div>

      {/* Mode Selector */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20
      }}>
        <button
          onClick={() => setMode('text')}
          disabled={generating}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: 8,
            border: mode === 'text' ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.2)',
            background: mode === 'text' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: generating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📝 Text to 3D
        </button>
        <button
          onClick={() => setMode('image')}
          disabled={generating}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: 8,
            border: mode === 'image' ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.2)',
            background: mode === 'image' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: generating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🖼️ Image to 3D
        </button>
      </div>

      {/* Text Mode */}
      {mode === 'text' && (
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
            placeholder="Describe the 3D model you want to create... (e.g., 'a futuristic robot with glowing blue eyes')"
            style={{
              width: '100%',
              minHeight: 100,
              padding: 15,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: 15
            }}
          />
          <button
            onClick={handleTextGeneration}
            disabled={generating || !prompt.trim()}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 8,
              border: 'none',
              background: generating || !prompt.trim() 
                ? 'rgba(139, 92, 246, 0.3)' 
                : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              cursor: generating || !prompt.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {generating ? '🔄 Generating...' : '✨ Generate 3D Model'}
          </button>
        </div>
      )}

      {/* Image Mode */}
      {mode === 'image' && (
        <div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageGeneration}
            disabled={generating}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={generating}
            style={{
              width: '100%',
              padding: '40px 24px',
              borderRadius: 8,
              border: '2px dashed rgba(139, 92, 246, 0.5)',
              background: 'rgba(139, 92, 246, 0.1)',
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              cursor: generating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {generating ? '🔄 Processing...' : '📤 Upload Image to Generate 3D Model'}
          </button>
          <div style={{
            marginTop: 12,
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center'
          }}>
            Supports: PNG, JPG, JPEG, WebP (Max 10MB)
          </div>
        </div>
      )}

      {/* Progress */}
      {(generating || status) && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            width: '100%',
            height: 6,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 12
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
              transition: 'width 0.3s ease',
              borderRadius: 3
            }} />
          </div>
          <div style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center'
          }}>
            {status}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 15,
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: 8,
          color: '#fca5a5',
          fontSize: 14
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Info */}
      <div style={{
        marginTop: 20,
        padding: 15,
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 8,
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#60a5fa' }}>
          ℹ️ How it works:
        </div>
        <div>
          • <strong>Text to 3D:</strong> Describe any object and AI will generate a 3D model<br/>
          • <strong>Image to 3D:</strong> Upload a photo and AI will create a 3D version<br/>
          • Generation takes 1-3 minutes depending on complexity<br/>
          • Models are automatically optimized and textured
        </div>
      </div>
    </div>
  );
}