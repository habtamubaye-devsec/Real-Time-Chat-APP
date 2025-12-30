import { BadRequestException, Injectable } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { UploadFileInput, UploadedFile } from './upload.type';

@Injectable()
export class UploadService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  async saveBase64File(input: UploadFileInput): Promise<UploadedFile> {
    const originalFilename = this.sanitizeFilename(input.filename);
    const { buffer } = this.decodeBase64(input.base64);

    const maxBytes = this.getMaxBytes();
    if (buffer.length > maxBytes) {
      throw new BadRequestException(`File too large. Max is ${maxBytes} bytes.`);
    }

    await fs.mkdir(this.uploadsDir, { recursive: true });

    const storedFilename = this.makeStoredFilename(originalFilename);
    const filePath = join(this.uploadsDir, storedFilename);

    await fs.writeFile(filePath, buffer);

    return {
      filename: storedFilename,
      url: this.buildPublicUrl(storedFilename),
    };
  }

  private decodeBase64(base64: string): { buffer: Buffer } {
    if (!base64 || typeof base64 !== 'string') {
      throw new BadRequestException('base64 is required');
    }

    const payload = base64.includes(',') ? (base64.split(',').pop() ?? '') : base64;

    let buffer: Buffer;
    try {
      buffer = Buffer.from(payload, 'base64');
    } catch {
      throw new BadRequestException('Invalid base64 payload');
    }

    if (buffer.length === 0) {
      throw new BadRequestException('Empty file');
    }

    return { buffer };
  }

  private sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      throw new BadRequestException('filename is required');
    }

    const base = basename(filename).trim();
    if (!base) {
      throw new BadRequestException('filename is invalid');
    }

    // Keep it simple: allow common safe characters
    const safe = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    return safe.length ? safe : 'file';
  }

  private makeStoredFilename(originalFilename: string): string {
    const ext = extname(originalFilename);
    const nameWithoutExt = ext ? originalFilename.slice(0, -ext.length) : originalFilename;
    const id = randomUUID();
    return `${nameWithoutExt}-${id}${ext}`;
  }

  private buildPublicUrl(storedFilename: string): string {
    const baseUrl = (process.env.PUBLIC_BASE_URL ?? '').trim();
    const encoded = encodeURIComponent(storedFilename);
    if (baseUrl) {
      return `${baseUrl.replace(/\/$/, '')}/uploads/${encoded}`;
    }
    return `/uploads/${encoded}`;
  }

  private getMaxBytes(): number {
    const raw = (process.env.UPLOAD_MAX_BYTES ?? '').trim();
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return 10 * 1024 * 1024;
  }
}
