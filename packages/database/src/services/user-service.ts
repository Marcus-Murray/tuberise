import { prisma } from '../client';
import { NotFoundError, ValidationError, DatabaseError } from '../types';

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(data: {
    email: string;
    name?: string;
    image?: string;
    googleId?: string;
  }) {
    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          googleId: data.googleId,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to create user: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to find user: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to find user: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Find user by Google ID
   */
  static async findByGoogleId(googleId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { googleId },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to find user: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get user with subscription
   */
  static async getUserWithSubscription(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          subscription: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(
          `Failed to find user with subscription: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get user with YouTube channels
   */
  static async getUserWithChannels(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          youtubeChannels: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(
          `Failed to find user with channels: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: any) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to update user: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Update last login
   */
  static async updateLastLogin(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          lastLoginAt: new Date(),
          loginCount: {
            increment: 1,
          },
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(
          `Failed to update last login: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to delete user: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate user data
   */
  static validateUserData(data: any): void {
    if (!data.email || typeof data.email !== 'string') {
      throw new ValidationError(
        'Email is required and must be a string',
        'email'
      );
    }

    if (!data.email.includes('@')) {
      throw new ValidationError('Email must be a valid email address', 'email');
    }

    if (data.name && typeof data.name !== 'string') {
      throw new ValidationError('Name must be a string', 'name');
    }

    if (data.image && typeof data.image !== 'string') {
      throw new ValidationError('Image must be a string', 'image');
    }

    if (data.googleId && typeof data.googleId !== 'string') {
      throw new ValidationError('Google ID must be a string', 'googleId');
    }
  }
}
