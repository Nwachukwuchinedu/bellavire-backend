import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Document processing service for lease templates and document generation
 */
class DocumentService {
  /**
   * Process lease template by replacing placeholders with actual data
   * @param {string} templatePath - Path to the original lease template
   * @param {Object} leaseData - Lease data with tenant, landlord, and property information
   * @returns {Promise<string>} - Path to the processed lease document
   */
  async processLeaseTemplate(templatePath, leaseData) {
    try {
      // Convert relative path to absolute path
      const absoluteTemplatePath = path.join(process.cwd(), templatePath.replace(/^\//, ''));
      
      // Check file extension
      const fileExtension = path.extname(absoluteTemplatePath).toLowerCase();
      
      // Read the original template based on file type
      let templateContent;
      
      if (fileExtension === '.pdf') {
        // For PDFs, copy the file as-is with tenant-specific naming
        // Note: PDF text extraction will be added in a future update
        const timestamp = Date.now();
        const tenantName = `${leaseData.tenant.firstName}_${leaseData.tenant.lastName}`.replace(/\s+/g, '_');
        const propertyName = leaseData.property.propertyName.replace(/\s+/g, '_');
        const processedFileName = `lease_${tenantName}_${propertyName}_${timestamp}.pdf`;
        const processedPath = path.join(__dirname, '../uploads/leases', processedFileName);
        
        // Ensure the directory exists
        await this.ensureDirectoryExists(path.dirname(processedPath));
        
        // Copy the PDF file as-is
        await fs.promises.copyFile(absoluteTemplatePath, processedPath);
        
        return processedPath;
      } else {
        // For text-based files (DOC, DOCX, TXT)
        templateContent = await fs.promises.readFile(absoluteTemplatePath, 'utf8');
        
        // Check if content is too large (limit to 5MB for text processing)
        if (templateContent.length > 5 * 1024 * 1024) {
          throw new Error('Template file is too large for processing. Please use a smaller template file.');
        }
      }
      
      // Replace placeholders with actual data
      const processedContent = this.replacePlaceholders(templateContent, leaseData);
      
      // Generate unique filename for the processed document with tenant identifier
      const timestamp = Date.now();
      const tenantName = `${leaseData.tenant.firstName}_${leaseData.tenant.lastName}`.replace(/\s+/g, '_');
      const propertyName = leaseData.property.propertyName.replace(/\s+/g, '_');
      const processedFileName = `lease_${tenantName}_${propertyName}_${timestamp}${fileExtension}`;
      const processedPath = path.join(__dirname, '../uploads/leases', processedFileName);
      
      // Ensure the directory exists
      await this.ensureDirectoryExists(path.dirname(processedPath));
      
      // Write the processed document
      await fs.promises.writeFile(processedPath, processedContent);
      
      return processedPath;
    } catch (error) {
      throw new Error(`Failed to process lease template: ${error.message}`);
    }
  }

  /**
   * Replace placeholders in the template with actual data
   * @param {string} content - Template content
   * @param {Object} leaseData - Lease data
   * @returns {string} - Processed content
   */
  replacePlaceholders(content, leaseData) {
    const {
      landlord,
      tenant,
      property,
      roomSelection,
      startDate,
      expirationDate,
      rent
    } = leaseData;

    const replacements = {
      '[Landlord\'s Full Name]': `${landlord.firstName} ${landlord.lastName}`,
      '[Landlord\'s Address]': landlord.address || 'N/A',
      '[Landlord\'s Phone Number]': landlord.phoneNumber || 'N/A',
      '[Landlord\'s Email Address]': landlord.email || 'N/A',
      '[Tenant\'s Full Name]': `${tenant.firstName} ${tenant.lastName}`,
      '[Tenant\'s Current Address]': tenant.address || 'N/A',
      '[Tenant\'s Phone Number]': tenant.phoneNumber || 'N/A',
      '[Tenant\'s Email Address]': tenant.email || 'N/A',
      '[Rental Property Address]': property.address || 'N/A',
      '[Apartment Number]': roomSelection.roomIdentifier || 'N/A',
      '[City,State,Zip Code]': `${property.cityOrTown}, ${property.regionOrCountry} ${property.postalCode}`,
      '[Dates]': `${this.formatDate(startDate)} to ${this.formatDate(expirationDate)}`,
      '[Monthly Rent]': `$${rent}`,
      '[Room Number]': roomSelection.roomIdentifier || 'N/A',
      '[Floor Number]': roomSelection.floor || 'N/A'
    };

    // Use more memory-efficient string replacement
    let processedContent = content;
    for (const [placeholder, value] of Object.entries(replacements)) {
      // Use simple string replace instead of regex for better performance
      processedContent = processedContent.split(placeholder).join(value);
    }

    return processedContent;
  }

  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted date
   */
  formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Ensure directory exists
   * @param {string} dirPath - Directory path
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.promises.access(dirPath);
    } catch (error) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Validate document upload
   * @param {Object} file - Uploaded file object
   * @param {Array} allowedTypes - Allowed file types
   * @param {number} maxSize - Maximum file size in bytes
   * @returns {boolean} - Whether file is valid
   */
  validateDocument(file, allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'], maxSize = 5 * 1024 * 1024) {
    if (!file) return false;
    
    // Check if originalname exists and is a string
    if (!file.originalname || typeof file.originalname !== 'string') {
      return false;
    }
    
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(fileExtension);
    const isValidSize = file.size <= maxSize;
    
    return isValidType && isValidSize;
  }

  /**
   * Get document type from filename
   * @param {string} filename - Filename
   * @returns {string} - Document type
   */
  getDocumentType(filename) {
    if (!filename || typeof filename !== 'string') {
      return 'unknown';
    }
    
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'word',
      'docx': 'word',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image'
    };
    return typeMap[extension] || 'unknown';
  }
}

export default new DocumentService();