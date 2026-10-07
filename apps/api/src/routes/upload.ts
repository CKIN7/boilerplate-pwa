import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { uploadBuffer, generateSignedUploadParams, UploadResult } from '../utils/cloudinary';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const uploadSingle = upload.single('file');

router.post('/upload', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        throw new AppError(400, `Error de subida: ${err.message}`);
      }
      throw err;
    }

    if (!req.file) {
      throw new AppError(400, 'No se proporcionó archivo');
    }

    const folder = req.body.folder || 'boilerplate';
    const result = await uploadBuffer(req.file.buffer, {
      folder,
      transformation: req.body.transform ? JSON.parse(req.body.transform) : undefined,
    });

    res.json({ success: true, data: result });
  });
}));

router.post('/upload-base64', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const schema = z.object({
    base64: z.string().min(1),
    folder: z.string().optional(),
    publicId: z.string().optional(),
  });

  const data = schema.parse(req.body);
  const result = await uploadBase64(data.base64, {
    folder: data.folder || 'boilerplate',
    publicId: data.publicId,
  });

  res.json({ success: true, data: result });
}));

router.get('/signed-upload', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const { folder, publicId } = req.query;

  const params = await generateSignedUploadParams(
    folder as string || 'boilerplate',
    publicId as string
  );

  res.json({ success: true, data: params });
}));

router.delete('/:publicId', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const resourceType = (req.query.resourceType as string) || 'image';

  const deleted = await deleteByPublicId(publicId, resourceType as any);
  if (!deleted) throw new AppError(404, 'Archivo no encontrado');

  res.json({ success: true, message: 'Archivo eliminado' });
}));

router.get('/optimized-url/:publicId', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const { width, height, crop, quality, format } = req.query;

  const url = await getOptimizedUrl(publicId, {
    width: width ? parseInt(width as string) : undefined,
    height: height ? parseInt(height as string) : undefined,
    crop: crop as any,
    quality: quality as any,
    format: format as any,
  });

  res.json({ success: true, data: { url } });
}));

export { router as uploadRouter };
export type { UploadResult };