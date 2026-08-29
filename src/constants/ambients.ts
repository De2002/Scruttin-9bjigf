export interface AmbientConfig {
  id: string;
  label: string;
  emoji: string;
  videoUrl: string;
  overlayOpacity: number;
  overlayColor: string;
  accentColor: string;
}

export const COLOR_BACKGROUNDS: AmbientConfig[] = [
  { id: 'color-blue', label: 'Harbor', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '42, 80, 106', accentColor: '#6bb9d8' },
  { id: 'color-sky', label: 'Sky', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '107, 185, 216', accentColor: '#ffffff' },
  { id: 'color-stone', label: 'Stone', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '108, 111, 106', accentColor: '#ffffff' },
  { id: 'color-slate', label: 'Slate', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '82, 102, 98', accentColor: '#ffffff' },
  { id: 'color-caramel', label: 'Caramel', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '183, 128, 76', accentColor: '#ffffff' },
  { id: 'color-plum', label: 'Plum', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '44, 14, 32', accentColor: '#ffffff' },
  { id: 'color-midnight', label: 'Midnight', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '25, 45, 61', accentColor: '#ffffff' },
  { id: 'color-cream', label: 'Cream', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '248, 240, 220', accentColor: '#192d3d' },
  { id: 'color-coffee', label: 'Coffee', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '64, 51, 41', accentColor: '#ffffff' },
  { id: 'color-cyan', label: 'Cyan', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '8, 174, 208', accentColor: '#ffffff' },
  { id: 'color-black', label: 'Black', emoji: '', videoUrl: '', overlayOpacity: 1, overlayColor: '0, 0, 0', accentColor: '#ffffff' },
];

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
