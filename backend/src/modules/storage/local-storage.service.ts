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

  constructor(config: ConfigService) {
    const defaultPath = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      ? join(tmpdir(), 'uploads')
      : './uploads';
    this.root = resolve(config.get('STORAGE_LOCAL_PATH', defaultPath));
  }

  async put(content: Buffer, extension = '') {
    await mkdir(this.root, { recursive: true });
    const key = `${randomUUID()}${extension}`;
    await writeFile(this.safePath(key), content, { flag: 'wx' });
    return key;
  }

  read(key: string) {
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
