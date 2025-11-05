/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
// (2) (cloudinary) Servicio para manejar subida de imágenes a Cloudinary
import { Injectable } from '@nestjs/common';
import { cloudinary } from './cloudinary.config';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  // Subir imagen a Cloudinary desde buffer de memoria
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Auto-detectar tipo de archivo
          folder: 'vadlink-avatars', // Organizar en carpeta específica
          transformation: [
            { width: 300, height: 300, crop: 'fill' }, // Redimensionar a 300x300
            { quality: 'auto' }, // Optimizar calidad automáticamente
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) resolve(result);
        },
      ).end(file.buffer);
    });
  }

  // Eliminar imagen de Cloudinary usando public_id
  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}