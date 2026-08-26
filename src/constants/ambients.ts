export interface AmbientConfig {
  id: string;
  label: string;
  emoji: string;
  videoUrl: string;
  overlayOpacity: number;
  overlayColor: string;
  accentColor: string;
}

export const AMBIENT_CONFIGS: AmbientConfig[] = [
  {
    id: 'off',
    label: 'Off',
    emoji: '◻',
    videoUrl: '',
    overlayOpacity: 0,
    overlayColor: 'transparent',
    accentColor: '#6b7280',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    emoji: '🌊',
    // Pexels — ocean waves on shore
    videoUrl: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4',
    overlayOpacity: 0.62,
    overlayColor: '10, 30, 60',
    accentColor: '#38bdf8',
  },
  {
    id: 'forest',
    label: 'Forest',
    emoji: '🌲',
    // Pexels — tall forest trees
    videoUrl: 'https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_30fps.mp4',
    overlayOpacity: 0.65,
    overlayColor: '8, 28, 16',
    accentColor: '#4ade80',
  },
  {
    id: 'rain',
    label: 'Rain',
    emoji: '🌧',
    // Pexels — rain on window glass
    videoUrl: 'https://videos.pexels.com/video-files/858356/858356-hd_1920_1080_30fps.mp4',
    overlayOpacity: 0.70,
    overlayColor: '15, 20, 38',
    accentColor: '#a5b4fc',
  },
  {
    id: 'night',
    label: 'Night',
    emoji: '🌙',
    // Pexels — night sky stars timelapse
    videoUrl: 'https://videos.pexels.com/video-files/1448726/1448726-hd_1920_1080_30fps.mp4',
    overlayOpacity: 0.75,
    overlayColor: '4, 4, 18',
    accentColor: '#e879f9',
  },
  {
    id: 'clouds',
    label: 'Clouds',
    emoji: '☁️',
    // Pexels — fluffy clouds timelapse
    videoUrl: 'https://videos.pexels.com/video-files/857251/857251-hd_1920_1080_30fps.mp4',
    overlayOpacity: 0.55,
    overlayColor: '25, 28, 48',
    accentColor: '#94a3b8',
  },
  {
    id: 'fireplace',
    label: 'Fireplace',
    emoji: '🔥',
    // Pexels — crackling fireplace
    videoUrl: 'https://videos.pexels.com/video-files/1093249/1093249-hd_1920_1080_25fps.mp4',
    overlayOpacity: 0.68,
    overlayColor: '38, 12, 4',
    accentColor: '#fb923c',
  },
  {
    id: 'city',
    label: 'City',
    emoji: '🏙',
    // Pexels — city street at night with traffic lights
    videoUrl: 'https://videos.pexels.com/video-files/3893658/3893658-hd_1920_1080_25fps.mp4',
    overlayOpacity: 0.70,
    overlayColor: '8, 10, 20',
    accentColor: '#facc15',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    emoji: '◼',
    videoUrl: '',
    overlayOpacity: 0,
    overlayColor: '12, 12, 16',
    accentColor: '#d1d5db',
  },
];

export function getAmbientById(id: string): AmbientConfig {
  return AMBIENT_CONFIGS.find(a => a.id === id) ?? AMBIENT_CONFIGS[0];
}
