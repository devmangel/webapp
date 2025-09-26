/**
 * Servicio para generar y validar UUIDs v4
 * Utiliza la API nativa crypto.randomUUID() de Node.js
 */
export class UuidService {
  
  /**
   * Genera un UUID v4 estándar RFC 4122
   * @returns UUID v4 en formato string
   * @throws Error si no se puede generar el UUID
   */
  generateV4(): string {
    try {
      // Usar la API nativa de Node.js (disponible desde Node 14+)
      return crypto.randomUUID();
    } catch (error) {
      console.error('Error generando UUID v4:', error);
      throw new Error('No se pudo generar UUID v4');
    }
  }

  /**
   * Valida si una cadena es un UUID v4 válido
   * @param uuid - Cadena a validar
   * @returns true si es un UUID v4 válido
   */
  isValidV4(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }

    // Regex para UUID v4: 8-4-4-4-12 caracteres hexadecimales
    // con '4' en la posición 14 (versión) y [8, 9, A, B] en la posición 19 (variant)
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    return uuidV4Regex.test(uuid);
  }

  /**
   * Genera múltiples UUIDs v4 únicos
   * @param count - Número de UUIDs a generar
   * @returns Array de UUIDs únicos
   * @throws Error si count es inválido o no se pueden generar los UUIDs
   */
  generateMultiple(count: number): string[] {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error('El contador debe ser un número entero positivo');
    }

    if (count > 1000) {
      throw new Error('No se pueden generar más de 1000 UUIDs a la vez');
    }

    try {
      const uuids: string[] = [];
      const uniqueSet = new Set<string>();

      // Generar UUIDs hasta obtener la cantidad solicitada (evitar duplicados)
      while (uuids.length < count) {
        const uuid = this.generateV4();
        
        if (!uniqueSet.has(uuid)) {
          uniqueSet.add(uuid);
          uuids.push(uuid);
        }
      }

      return uuids;
    } catch (error) {
      console.error('Error generando múltiples UUIDs:', error);
      throw new Error(`No se pudieron generar ${count} UUIDs`);
    }
  }

  /**
   * Convierte un UUID a formato sin guiones
   * @param uuid - UUID en formato estándar
   * @returns UUID sin guiones
   * @throws Error si el UUID no es válido
   */
  removeHyphens(uuid: string): string {
    if (!this.isValidV4(uuid)) {
      throw new Error('UUID inválido');
    }

    return uuid.replace(/-/g, '');
  }

  /**
   * Convierte un UUID sin guiones al formato estándar
   * @param uuid - UUID sin guiones (32 caracteres hex)
   * @returns UUID en formato estándar con guiones
   * @throws Error si el formato es inválido
   */
  addHyphens(uuid: string): string {
    if (!uuid || uuid.length !== 32 || !/^[0-9a-f]{32}$/i.test(uuid)) {
      throw new Error('Formato de UUID sin guiones inválido');
    }

    const formatted = `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
    
    if (!this.isValidV4(formatted)) {
      throw new Error('El UUID formateado no es válido v4');
    }

    return formatted;
  }
}
