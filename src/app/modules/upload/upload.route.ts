import { v2 as cloudinary } from 'cloudinary';
import express, { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';

// Use Cloudinary in production (Render's disk is ephemeral). Falls back to
// local disk storage in development when no Cloudinary creds are set.
const useCloudinary =
  !!process.env.CLOUDINARY_URL ||
  !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

if (useCloudinary && !process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadDir = path.join(process.cwd(), 'uploads');
if (!useCloudinary && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, unique);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const uploadToCloudinary = (buffer: Buffer): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'highway-hoppers' },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Upload failed'));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

const router = express.Router();

router.post(
  '/',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.TRAVELLER
  ),
  upload.single('file'),
  async (req: Request, res: Response) => {
    const file = (
      req as Request & {
        file?: { buffer: Buffer; filename: string };
      }
    ).file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file uploaded' });
    }

    try {
      const url = useCloudinary
        ? await uploadToCloudinary(file.buffer)
        : `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        url,
        data: { url },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: (err as Error)?.message || 'Upload failed',
      });
    }
  }
);

export const UploadRoutes = router;
