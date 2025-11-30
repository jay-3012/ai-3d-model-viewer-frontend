import React, { useRef, useState } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { isModelFile, isTextureFile } from '../utils/helpers';

interface UploadZoneProps {
  onUploadSuccess: (modelUrl: string) => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress, status, error } = useFileUpload(onUploadSuccess);
  const [isDragging, setIsDragging] = useState(false);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log(`Selected ${files.length} files from folder`);
    await processFiles(files);

    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log(`Selected ${files.length} files`);
    await processFiles(files);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    // Organize files
    const modelFiles = files.filter(f => isModelFile(f.name));
    const textureFiles = files.filter(f => isTextureFile(f.name));
    
    console.log(`Found ${modelFiles.length} model(s) and ${textureFiles.length} texture(s)`);
    
    if (modelFiles.length === 0) {
      alert('No model files found. Please upload GLB, GLTF, FBX, OBJ, DAE, or STL files.');
      return;
    }

    // Upload all files
    await upload(files);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

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
      await processFiles(files);
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
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div>
      {/* Main Drop Zone */}
      <div
        style={{
          background: isDragging 
            ? 'rgba(59, 130, 246, 0.2)' 
            : 'rgba(59, 130, 246, 0.05)',
          border: `2px dashed ${isDragging ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 0.3)'}`,
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: uploading ? 'not-allowed' : 'pointer',
          position: 'relative',
        }}
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

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".glb,.gltf,.fbx,.obj,.dae,.stl,.png,.jpg,.jpeg,.webp"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />

        <div style={{ fontSize: 48, marginBottom: 15 }}>
          {uploading ? '⏳' : '📤'}
        </div>
        
        <div style={{ 
          fontSize: 18, 
          fontWeight: 700, 
          marginBottom: 15, 
          color: '#60a5fa' 
        }}>
          {uploading ? 'Uploading...' : 'Drop Files or Folder Here'}
        </div>
        
        <div style={{ 
          fontSize: 14, 
          color: 'rgba(255, 255, 255, 0.6)', 
          marginBottom: 20 
        }}>
          Drag and drop your 3D model files or folder with textures
        </div>

        {/* Action Buttons */}
        {!uploading && (
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              📄 Browse Files
            </button>
            
            <button
              onClick={() => folderInputRef.current?.click()}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              📁 Browse Folder
            </button>
          </div>
        )}

        {/* Progress */}
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
            <div style={{ 
              fontSize: 14, 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontWeight: 600 
            }}>
              {status}
            </div>
          </div>
        )}

        {/* Supported Formats */}
        <div style={{
          marginTop: 20,
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.4)'
        }}>
          Supports: GLB, GLTF, FBX, OBJ, DAE, STL + textures (PNG, JPG, WebP)
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: 15,
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: 8,
            padding: '12px 16px',
            color: '#fca5a5',
            fontSize: 14,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Tips */}
      <div style={{
        marginTop: 20,
        padding: 15,
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 8,
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#60a5fa' }}>
          💡 Tips:
        </div>
        <div>
          • Upload entire folder containing model + textures for best results<br />
          • FBX, OBJ, and other formats will be automatically converted to GLB<br />
          • Textures will be automatically embedded into your model<br />
          • Large files may take a few minutes to process
        </div>
      </div>
    </div>
  );
}