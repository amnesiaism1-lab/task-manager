import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

@Injectable()
export class LocalStorageService {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = resolve(config.get('STORAGE_LOCAL_PATH', './uploads'));
  }

  async put(content: Buffer, extension = '') {
    await mkdir(this.root, { recursive: true });
    const key = `${randomUUID()}${extension}`;
    await writeFile(this.safePath(key), content, { flag: 'wx' });
    return key;
  }

  read(key: string) {
    return createReadStream(this.safePath(key));
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
