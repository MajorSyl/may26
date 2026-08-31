export type VideoPlatform = 'youtube' | 'facebook' | 'instagram' | 'drive' | 'unknown';

export interface ParsedVideo {
  platform: VideoPlatform;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  originalUrl: string;
  platformLabel: string;
}

const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  drive: 'Google Drive',
  unknown: 'the source'
};

// Turns a link an admin pastes (YouTube/Facebook/Instagram/Drive share
// link) into an embeddable iframe URL, or null if we can't confidently
// build one -- callers should fall back to a thumbnail + "Watch on X"
// link in that case, since some of these platforms restrict framing
// depending on the individual video/post's privacy settings.
export function parseVideoUrl(url: string): ParsedVideo {
  const trimmed = url.trim();

  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      originalUrl: trimmed,
      platformLabel: PLATFORM_LABELS.youtube
    };
  }

  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const id = driveMatch[1];
    return {
      platform: 'drive',
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      thumbnailUrl: null,
      originalUrl: trimmed,
      platformLabel: PLATFORM_LABELS.drive
    };
  }

  if (/facebook\.com|fb\.watch/.test(trimmed)) {
    return {
      platform: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false`,
      thumbnailUrl: null,
      originalUrl: trimmed,
      platformLabel: PLATFORM_LABELS.facebook
    };
  }

  if (/instagram\.com\/(p|reel|tv)\//.test(trimmed)) {
    const clean = trimmed.split('?')[0].replace(/\/$/, '');
    return {
      platform: 'instagram',
      embedUrl: `${clean}/embed`,
      thumbnailUrl: null,
      originalUrl: trimmed,
      platformLabel: PLATFORM_LABELS.instagram
    };
  }

  return { platform: 'unknown', embedUrl: null, thumbnailUrl: null, originalUrl: trimmed, platformLabel: PLATFORM_LABELS.unknown };
}
