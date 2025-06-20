import * as path from 'path';

export const FILE_GET_FIELDS = [
  ['file.id', 'file.caption', 'file.uniqueName', 'file.mime', 'file.ext', 'file.size', 'file.isTemp', 'file.status', 'file.createdAt'],
  ['category.id', 'category.nameLocalized'],
];

export const FILE_ROOT_PATH = path.resolve(process.cwd(), 'uploads');
export const THUMBNAIL_PATH = path.join(FILE_ROOT_PATH, 'thumbnails');

export const MAX_FILES_TO_UPLOAD = 5;
export const MAX_FILE_SIZE_IN_BYTES = 10 * 1024 * 1024;
export const MAX_AVATAR_FILE_SIZE_IN_BYTES = 1 * 1024 * 1024;

export const THUMBNAIL_SIZES = { medium: 768, small: 360 };

export const VALID_IMAGE_MIME_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
export const VALID_AUDIO_MIME_TYPES = ['audio/webm', 'audio/mpeg', 'audio/wav'];
export const VALID_VIDEO_MIME_TYPES = ['video/webm', 'video/mp4', 'video/x-msvideo'];
export const VALID_COMPRESS_MIME_TYPES = ['application/vnd.rar', 'application/x-rar-compressed', 'application/zip'];
export const VALID_DOCUMENT_MIME_TYPES = [
  'text/plain',
  'text/xml',
  'application/xml',
  'application/pdf',
  'application/json',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
export const VALID_ALL_MIME_TYPES = [
  ...VALID_IMAGE_MIME_TYPES,
  ...VALID_AUDIO_MIME_TYPES,
  ...VALID_VIDEO_MIME_TYPES,
  ...VALID_COMPRESS_MIME_TYPES,
  ...VALID_DOCUMENT_MIME_TYPES,
];

export enum FILE_STATUS {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  DELETED = 'deleted',
}
