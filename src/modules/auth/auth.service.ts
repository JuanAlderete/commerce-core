import bcrypt from 'bcrypt';
import { userRepository } from '../users/users.repository.js';

export class AuthService {
  async validateUser(email: string, pass: string) {
    // 1. Buscamos el usuario
    const user = await userRepository.findByEmail(email);

    // 2. Si no existe, devolvemos null (no lanzamos error específico por seguridad)
    // "Security by Obscurity": No le digas al atacante si el email existe o no.
    if (!user) {
      return null;
    }

    // 3. Comparamos passwords
    const isValid = await bcrypt.compare(pass, user.password_hash);

    if (!isValid) {
      return null;
    }

    // 4. Devolvemos el usuario limpio (sin hash)
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();