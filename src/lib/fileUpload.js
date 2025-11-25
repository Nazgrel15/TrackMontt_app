// src/lib/fileUpload.js
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'incidents');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

/**
 * Guarda un archivo de imagen en el sistema de archivos local
 * @param {File} file - Archivo a guardar
 * @returns {Promise<string>} - Ruta relativa del archivo guardado
 */
export async function saveIncidentPhoto(file) {
    // Validar que el archivo existe
    if (!file) {
        throw new Error('No se proporcionó archivo');
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Solo imágenes JPEG, PNG o WebP.');
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
    }

    // Crear directorio si no existe
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generar nombre único basado en timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `incident-${timestamp}.${extension}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar archivo
    await writeFile(filepath, buffer);

    // Retornar ruta relativa (accesible desde /public)
    return `/uploads/incidents/${filename}`;
}

/**
 * Valida si un archivo es una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {boolean}
 */
export function isValidImage(file) {
    if (!file) return false;
    return ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;
}
