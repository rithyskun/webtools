export class InputSanitizer {
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizeString(input: string, maxLength: number = 1000): string {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '');
  }

  static validateFileSize(size: number, maxSizeMB: number = 10): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return size <= maxBytes;
  }

  static validateFileName(filename: string): boolean {
    const dangerousPatterns = /[<>:"|?*\x00-\x1f]/;
    const pathTraversal = /\.\./;
    
    return !dangerousPatterns.test(filename) && !pathTraversal.test(filename);
  }

  static sanitizeFileName(filename: string): string {
    return filename
      .replace(/[<>:"|?*\x00-\x1f]/g, '')
      .replace(/\.\./g, '')
      .slice(0, 255);
  }

  static validateContentType(contentType: string, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => contentType.startsWith(type));
  }
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
  'text/csv',
];

export const MAX_FILE_SIZE_MB = 4;
export const MAX_ATTACHMENTS = 10;
