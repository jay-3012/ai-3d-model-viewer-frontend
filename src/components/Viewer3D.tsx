import { Scene3D } from './Scene3D';

interface Viewer3DProps {
  modelUrl: string;
}

export function Viewer3D({ modelUrl }: Viewer3DProps) {
  return <Scene3D modelUrl={modelUrl} />;
}