import React, { useRef } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

interface UploadZoneProps {
  onUploadSuccess: (modelUrl: string) => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress, status, error } = useFileUpload(onUploadSuccess);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log(`Selected ${files.length} files from folder`);
    await upload(files);

    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';

    const items = Array.from(e.dataTransfer.items);
    const files: File[] = [];

    // Read all files including from folders
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          await readEntry(entry, files);
        } else {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    }

    console.log(`Dropped ${files.length} files`);
    if (files.length > 0) {
      await upload(files);
    }
  };

  // Recursively read directory entries
  const readEntry = async (entry: any, files: File[]): Promise<void> => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file((file: File) => {
          files.push(file);
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      return new Promise((resolve) => {
        reader.readEntries(async (entries: any[]) => {
          for (const entry of entries) {
            await readEntry(entry, files);
          }
          resolve();
        });
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 1)';
    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 700, color: 'white' }}>
        <div style={{ fontSize: 80, marginBottom: 30 }}>🏗️</div>

        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 20,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          AI 3D Model Viewer
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.8,
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: 40,
          }}
        >
          Upload your 3D model folder (with source/ and textures/) or individual files
          to explore them in an immersive walkable environment.
        </p>

        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px dashed rgba(59, 130, 246, 0.5)',
            borderRadius: 16,
            padding: 50,
            marginBottom: 30,
            transition: 'all 0.3s ease',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
          onClick={() => !uploading && folderInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore - webkitdirectory is not in types but works
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={handleFolderSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />

          <div style={{ fontSize: 48, marginBottom: 15 }}>📁</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 15, color: '#3b82f6' }}>
            {uploading ? 'Uploading...' : 'Drop Folder Here or Click to Browse'}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 10 }}>
            Drag your entire model folder with source/ and textures/ subfolders
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.4)' }}>
            Supports: GLB, GLTF, FBX, OBJ + PNG, JPG textures
          </div>

          {(uploading || status) && (
            <div style={{ marginTop: 25 }}>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    transition: 'width 0.3s ease',
                    borderRadius: 4,
                  }}
                />
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                {status}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 20,
              color: '#fca5a5',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div
          style={{
            marginTop: 30,
            padding: 25,
            background: 'rgba(59, 130, 246, 0.05)',
            borderRadius: 16,
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 15, color: '#60a5fa', fontSize: 16 }}>
            📦 Expected Folder Structure:
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'left',
              fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.3)',
              padding: 15,
              borderRadius: 8,
              lineHeight: 1.8
            }}
          >
            your-model/<br />
            ├── source/<br />
            │   └── model.glb<br />
            └── textures/<br />
            &nbsp;&nbsp;&nbsp;&nbsp;├── texture1.png<br />
            &nbsp;&nbsp;&nbsp;&nbsp;├── texture2.png<br />
            &nbsp;&nbsp;&nbsp;&nbsp;└── ...
          </div>
          <div style={{ marginTop: 15, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            ✨ Textures will be automatically embedded into your GLB file
          </div>
        </div>
      </div>
    </div>
  );
}