const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_DOCUMENT_MIME_TYPES = new Set(['application/pdf']);
const ENTITY_CONFIG = {
  certification: {
    folder: 'portfolio/certifications',
    nameFields: ['certification_name', 'title'],
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
    resource_type: 'image',
  },
  project: {
    folder: 'portfolio/projects',
    nameFields: ['project_name', 'title'],
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
    resource_type: 'image',
  },
  document: {
    folder: 'portfolio/documents',
    nameFields: ['document_type', 'type'],
    allowedMimeTypes: ALLOWED_DOCUMENT_MIME_TYPES,
    resource_type: 'raw',
  },
};

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'portfolio-file';
}

function resolveEntityName(req, entityType) {
  const config = ENTITY_CONFIG[entityType];
  if (!config) {
    throw new Error(`Unsupported upload type: ${entityType}`);
  }

  for (const field of config.nameFields) {
    const value = req.body?.[field];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return entityType;
}

function ensureCloudinaryConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary environment variables are not fully configured');
  }
}

function createStorage(entityType) {
  const entity = ENTITY_CONFIG[entityType];
  
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      ensureCloudinaryConfigured();

      if (!entity.allowedMimeTypes.has(file.mimetype)) {
        throw new Error(`Only ${Array.from(entity.allowedMimeTypes).join(', ')} files are allowed`);
      }

      const params = {
        folder: entity.folder,
        resource_type: entity.resource_type,
        public_id: slugify(resolveEntityName(req, entityType)),
        overwrite: true,
        invalidate: true,
      };

      if (entity.resource_type === 'image') {
        params.allowed_formats = ['jpg', 'jpeg', 'png', 'webp'];
      }

      return params;
    },
  });
}

function createFileFilter(entityType) {
  const entity = ENTITY_CONFIG[entityType];
  
  return (req, file, cb) => {
    if (entity.allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    const mimeTypesStr = Array.from(entity.allowedMimeTypes).join(', ');
    cb(new Error(`Only ${mimeTypesStr} files are allowed`), false);
  };
}

function createUpload(entityType) {
  return multer({
    storage: createStorage(entityType),
    fileFilter: createFileFilter(entityType),
    limits: {
      fileSize: MAX_FILE_SIZE_BYTES,
    },
  });
}

function getUploadedFileUrl(file) {
  return file?.path || file?.secure_url || file?.url || null;
}

module.exports = {
  createUpload,
  getUploadedFileUrl,
  getUploadedImageUrl: getUploadedFileUrl,
  MAX_FILE_SIZE_BYTES,
};
