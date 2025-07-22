import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';

export const uploads = (fileBuffer, originalName, customFolder = 'general') => {
    return new Promise((resolve, reject) => {
        try {
            const baseUploadPath = path.join(process.cwd(), 'uploads', customFolder);

            if (!fs.existsSync(baseUploadPath)) {
                fs.mkdirSync(baseUploadPath, { recursive: true });
            }

            const uniqueName = `${Date.now()}_${uuidv4()}_${originalName.replace(/\s+/g, '_')}`;
            const fullPath = path.join(baseUploadPath, uniqueName);

            fs.writeFile(fullPath, fileBuffer, (err) => {
                if (err) return reject(err);

                const relativePath = `/uploads/${customFolder}/${uniqueName}`.replace(/\\/g, '/');

                // Get full MIME type
                const mimeType = mime.lookup(originalName); // e.g. 'video/mp4'
                const fileExtension = path.extname(originalName); // e.g. '.mp4'

                // Map to simple type
                let fileType = 'other';
                if (mimeType?.startsWith('image/')) {
                    fileType = 'image';
                } else if (mimeType?.startsWith('video/')) {
                    fileType = 'video';
                } else if (mimeType === 'application/pdf') {
                    fileType = 'pdf';
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