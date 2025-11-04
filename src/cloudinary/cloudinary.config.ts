// (1) (cloudinary) Configuración de Cloudinary para subida de imágenes
import { v2 as cloudinary } from 'cloudinary';

// Configurar credenciales de Cloudinary
// Si existe CLOUDINARY_URL (formato: cloudinary://key:secret@cloudname) úsala directamente.
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  // Si no, usa las variables individuales con valores por defecto para desarrollo.
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Aviso si faltan credenciales (útil en desarrollo)
if (!process.env.CLOUDINARY_URL && (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
  // No lanzar un error para no romper procesos que no necesiten Cloudinary en todos los entornos,
  // pero registrar para facilitar debugging.
  // eslint-disable-next-line no-console
  console.warn('[cloudinary] Credenciales incompletas. Asegúrate de configurar CLOUDINARY_URL o CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET.');
}

export { cloudinary };