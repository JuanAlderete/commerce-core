import bcrypt from 'bcrypt';
import { userRepository } from './users.repository.js';
import { NewUser, UserUpdate } from './users.schema.js';

export class UserService {
  // Recibimos los datos crudos (password plano)
  async registerUser(input: Omit<NewUser, 'password_hash'> & { password: string }) {
    const { email, password, full_name } = input;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error: any = new Error('User already exists');
      error.statusCode = 409;
      throw error;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await userRepository.create({
      email,
      full_name,
      password_hash: passwordHash,
      is_guest: false,
      role: 'user',
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
      created_at: newUser.created_at
    };
  }

  async findUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async findAllUsers() {
    return await userRepository.findAll();
  }

  async updateUser(id: string, input: { email?: string; full_name?: string; password?: string }) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const updateData: UserUpdate = {
      email: input.email,
      full_name: input.full_name,
      updated_at: new Date(),
    };

    if (input.password) {
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(input.password, saltRounds);
    }

    return await userRepository.update(id, updateData);
  }

  async deleteUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return await userRepository.delete(id);
  }

  async authenticate(email: string, passwordPlain: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return null;
    }
    const isValid = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isValid) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
  }

  async findOrCreateGuest(email: string, fullName: string = 'Guest User') {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return existingUser;
    }

    const newUser = await userRepository.create({
      email,
      full_name: fullName,
      role: 'guest',
      password_hash: null as any,
      is_guest: true
    });

    return newUser;
  }
}

export const userService = new UserService();