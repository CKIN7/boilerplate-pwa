import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: Array<Record<string, any>>;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  overwrite?: boolean;
  invalidate?: boolean;
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resourceType: string;
}

export async function uploadBuffer(
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'boilerplate',
        public_id: options.publicId,
        transformation: options.transformation || [
          { width: 800, height: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
        resource_type: options.resourceType || 'image',
        overwrite: options.overwrite ?? true,
        invalidate: options.invalidate ?? true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          resourceType: result.resource_type,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function uploadBase64(
  base64: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const buffer = Buffer.from(base64.replace(/^data:.+;base64,/, ''), 'base64');
  return uploadBuffer(buffer, options);
}

export async function deleteByPublicId(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result.result === 'ok';
  } catch {
    return false;
  }
}

export async function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'scale' | 'fit' | 'limit' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): Promise<string> {
  return cloudinary.url(publicId, {
    transformation: [
      { width: options.width, height: options.height, crop: options.crop || 'fill' },
      { quality: options.quality || 'auto' },
      { fetch_format: options.format || 'auto' },
    ],
    secure: true,
  });
}

export async function generateSignedUploadParams(folder = 'boilerplate', publicId?: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
    public_id: publicId,
    overwrite: true,
    invalidate: true,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, config.cloudinary.apiSecret);

  return {
    ...paramsToSign,
    signature,
    apiKey: config.cloudinary.apiKey,
    cloudName: config.cloudinary.cloudName,
    folder,
    publicId,
  };
}