import axios from 'axios';

import Document from '../models/Document.js';
import { getUploadedFileUrl } from '../middleware/upload.js';

const VALID_DOCUMENT_TYPES = ['resume', 'cv'];

function isValidDocumentType(type) {
  return VALID_DOCUMENT_TYPES.includes(type);
}

async function getAll(req, res) {
  try {
    const documents = await Document.getAll();
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error fetching documents:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch documents',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function getByType(req, res) {
  try {
    const { type } = req.params;

    if (!isValidDocumentType(type)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    const document = await Document.getByType(type);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error fetching document:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function upload(req, res) {
  try {
    const { type } = req.body;

    if (!isValidDocumentType(type)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const fileUrl = getUploadedFileUrl(req.file);
    if (!fileUrl) {
      console.error('File uploaded but no URL extracted:', req.file);
      return res.status(500).json({ success: false, message: 'Failed to extract file URL from upload' });
    }

    console.log(`[UPLOAD] Document type: ${type}`);
    console.log(`[UPLOAD] File MIME type: ${req.file.mimetype}`);
    console.log(`[UPLOAD] File size: ${req.file.size}`);
    console.log(`[UPLOAD] File URL from Cloudinary: ${fileUrl}`);

    try {
      const document = await Document.upsert({ type, fileUrl });
      res.json({ success: true, message: 'Document uploaded successfully', data: document });
    } catch (dbError) {
      console.error('Database error while upserting document:', dbError.message, dbError.stack);
      throw new Error(`Failed to save document to database: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Error uploading document:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function deleteDocument(req, res) {
  try {
    const { type } = req.params;

    if (!isValidDocumentType(type)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    try {
      const deleted = await Document.deleteByType(type);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      res.json({ success: true, message: 'Document deleted successfully', data: deleted });
    } catch (dbError) {
      console.error('Database error while deleting document:', dbError.message, dbError.stack);
      throw new Error(`Failed to delete document: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Error deleting document:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function downloadDocument(req, res) {
  try {
    const { type } = req.params;

    // Validate type
    if (!isValidDocumentType(type)) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    // Get document from database
    let document;
    try {
      document = await Document.getByType(type);
    } catch (dbError) {
      console.error('Database error:', dbError.message);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ success: false, message: 'Failed to fetch document' });
    }

    if (!document) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    let fileUrl = document.fileUrl;
    if (!fileUrl) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ success: false, message: 'File URL is missing' });
    }

    console.log(`[DOWNLOAD] Starting download for type: ${type}`);
    console.log(`[DOWNLOAD] File URL: ${fileUrl}`);

    // Ensure HTTPS
    if (fileUrl.startsWith('http://')) {
      fileUrl = fileUrl.replace('http://', 'https://');
    }

    // Fetch buffer from Cloudinary
    let buffer;
    try {
      buffer = await fetchFileBuffer(fileUrl);
    } catch (fetchError) {
      console.error('Cloudinary fetch error:', fetchError.message);
      res.setHeader('Content-Type', 'application/json');
      return res.status(502).json({ success: false, message: 'Failed to fetch PDF from storage' });
    }

    // Validate buffer
    if (!buffer || buffer.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ success: false, message: 'Received empty file' });
    }

    console.log(`[DOWNLOAD] Buffer size: ${buffer.length} bytes`);
    console.log(`[DOWNLOAD] First 10 bytes: ${buffer.slice(0, 10).toString('hex')}`);

    // Verify PDF magic bytes (more lenient check)
    const magicBytesValid = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44;
    
    if (!magicBytesValid) {
      console.warn('PDF magic bytes check failed. First 20 bytes:', buffer.slice(0, 20).toString('hex'));
      console.warn('Buffer length:', buffer.length);
      console.warn('Document type:', type);
      
      // Log for debugging - PDF might still be valid
      console.warn('Warning: File may not be a valid PDF, but attempting to serve anyway');
    }

    // All validations passed - NOW set PDF headers and send
    console.log(`[DOWNLOAD] Sending PDF file for type: ${type}`);
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${type}.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Connection', 'keep-alive');

    // Write buffer to response
    res.write(buffer, 'binary');
    res.end();
  } catch (error) {
    console.error('Unexpected error in downloadDocument:', error);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      // Headers already sent, can't send error response
      res.end();
    }
  }
}

function fetchFileBuffer(url) {
  return axios.get(url, {
    timeout: 15000,
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Portfolio-App/1.0',
      'Accept': 'application/pdf'
    },
    maxRedirects: 5
  })
  .then(response => {
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status} from Cloudinary`);
    }
    return Buffer.from(response.data);
  })
  .catch(error => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout while downloading PDF (15s)');
    }
    throw new Error(`Failed to fetch PDF from Cloudinary: ${error.message}`);
  });
}

export default {
  getAll,
  getByType,
  upload,
  deleteDocument,
  downloadDocument,
};
