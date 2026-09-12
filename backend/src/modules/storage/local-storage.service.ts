import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';

@Injectable()
export class LocalStorageService {
  private readonly root: string;
  private static memoryCache = new Map<string, Buffer>();

  constructor(config: ConfigService) {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
    this.root = isServerless ? join(tmpdir(), 'uploads') : resolve(config.get('STORAGE_LOCAL_PATH', './uploads'));
  }

  async put(content: Buffer, extension = '') {
    const key = `${randomUUID()}${extension}`;
    LocalStorageService.memoryCache.set(key, content);
    try {
      await mkdir(this.root, { recursive: true });
      await writeFile(this.safePath(key), content, { flag: 'w' });
    } catch {
      // Memory fallback remains active in serverless execution context
    }
    return key;
  }

  read(key: string) {
    if (LocalStorageService.memoryCache.has(key)) {
      const { Readable } = require('node:stream');
      return Readable.from(LocalStorageService.memoryCache.get(key)!);
    }
    const filePath = this.safePath(key);
    if (!require('node:fs').existsSync(filePath)) {
      const { Readable } = require('node:stream');
      return Readable.from(Buffer.from(''));
    }
    return createReadStream(filePath);
  }

  async remove(key: string) {
    try { await rm(this.safePath(key), { force: true }); } catch { throw new NotFoundException('Stored file not found'); }
  }

  private safePath(key: string) {
    const path = resolve(join(this.root, key));
    const relativePath = relative(this.root, path);
    if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath)) throw new NotFoundException('Invalid storage key');
    return path;
  }
}
