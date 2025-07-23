import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';

export const uploads = (fileBuffer, originalName, customFolder = 'general') => {
    return new Promise((resolve, reject) => {
        try {
            const baseUploadPath = path.join(process.cwd(), 'src', 'uploads', customFolder);

            if (!fs.existsSync(baseUploadPath)) {
                fs.mkdirSync(baseUploadPath, { recursive: true });
            }

            const uniqueName = `${Date.now()}_${uuidv4()}_${originalName.replace(/\s+/g, '_')}`;
            const fullPath = path.join(baseUploadPath, uniqueName);

            fs.writeFile(fullPath, fileBuffer, (err) => {
                if (err) return reject(err);

                const relativePath = `/src/uploads/${customFolder}/${uniqueName}`.replace(/\\/g, '/');

                // Get full MIME type
                const mimeType = mime.lookup(originalName); 
                const fileExtension = path.extname(originalName).toLowerCase(); 

                // Allowed types
                const allowedImage = mimeType && mimeType.startsWith('image/');
                const allowedPdf = mimeType === 'application/pdf';
                const allowedDocs = ['.doc', '.docx'];
                const allowedDoc = allowedDocs.includes(fileExtension);

                if (!allowedImage && !allowedPdf && !allowedDoc) {
                    return reject(new Error('Only images, PDF, and document files are allowed.'));
                }

                // Map to simple type
                let fileType = 'other';
                if (allowedImage) {
                    fileType = 'image';
                } else if (allowedPdf) {
                    fileType = 'pdf';
                } else if (allowedDoc) {
                    fileType = 'document';
                }

                resolve({
                    path: relativePath,
                    type: fileType, // image | video | pdf | other
                    extension: fileExtension || '',
                });
            });
        } catch (error) {
            reject(error);
        }
    });
};

export const deleteFile = (relativePath) => {
    return new Promise((resolve, reject) => {
        try {
            // Normalize path: remove leading slashes and convert to absolute
            const sanitizedPath = relativePath.replace(/^\/+/, '');
            const absolutePath = path.join(process.cwd(), sanitizedPath);

            // Check if file exists
            if (fs.existsSync(absolutePath)) {
                // Delete the file
                fs.unlink(absolutePath, (err) => {
                    if (err) return reject(err);
                    resolve(true);
                });
            } else {
                resolve(false); // File not found — nothing to delete
            }
        } catch (error) {
            reject(error);
        }
    });
}; 