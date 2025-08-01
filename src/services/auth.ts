import bcrypt from 'bcryptjs';
import { AuthSession, User, LoginCredentials, RegisterCredentials, AuthError } from '@/types/auth';

const STORAGE_KEY = 'miniseller_auth_session';
const USERS_STORAGE_KEY = 'miniseller_users';
const SALT_ROUNDS = 12;

// Session duration constants
const SESSION_DURATION = {
  DEFAULT: 24 * 60 * 60 * 1000, // 24 hours
  REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export class AuthService {
  /**
   * Generate a secure random token
   */
  private static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a unique user ID
   */
  private static generateUserId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2);
  }

  /**
   * Hash password using bcrypt
   */
  private static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  private static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private static isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  }

  /**
   * Get all stored users
   */
  private static getStoredUsers(): Array<User & { passwordHash: string }> {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve stored users:', error);
      return [];
    }
  }

  /**
   * Save users to storage
   */
  private static saveUsers(users: Array<User & { passwordHash: string }>): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Find user by email
   */
  private static findUserByEmail(email: string): (User & { passwordHash: string }) | null {
    const users = this.getStoredUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Find user by ID
   */
  private static findUserById(id: string): (User & { passwordHash: string }) | null {
    const users = this.getStoredUsers();
    return users.find(user => user.id === id) || null;
  }

  /**
   * Initialize mock users for development/demo purposes
   */
  private static async initializeMockUsers(): Promise<void> {
    const existingUsers = this.getStoredUsers();
    
    // Only initialize if no users exist
    if (existingUsers.length > 0) {
      return;
    }

    console.log('Initializing mock users for development...');

    const mockUsers = [
      {
        id: 'user_admin_001',
        email: 'admin@miniseller.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+66 123-456-7890',
        bio: 'MiniSeller platform administrator with full access to all features and analytics.',
        socialLinks: {
          facebook: 'https://facebook.com/miniseller',
          twitter: 'https://twitter.com/miniseller',
          linkedin: 'https://linkedin.com/company/miniseller'
        },
        createdAt: new Date('2024-01-01').toISOString(),
        lastLoginAt: new Date().toISOString(),
        passwordHash: await this.hashPassword('Admin123!')
      },
      {
        id: 'user_demo_002',
        email: 'demo@shopowner.com',
        firstName: 'Somchai',
        lastName: 'Merchant',
        phone: '+66 987-654-3210',
        bio: 'Thai e-commerce shop owner specializing in fashion and accessories. Managing multiple platforms including Shopee and Lazada.',
        socialLinks: {
          facebook: 'https://facebook.com/somchaishop',
          instagram: 'https://instagram.com/somchaifashion'
        },
        createdAt: new Date('2024-02-15').toISOString(),
        lastLoginAt: new Date().toISOString(),
        passwordHash: await this.hashPassword('Demo123!')
      },
      {
        id: 'user_seller_003',
        email: 'seller@thaistore.co.th',
        firstName: 'Malee',
        lastName: 'Entrepreneur',
        phone: '+66 555-123-456',
        bio: 'Electronics and gadgets seller with 5+ years experience in Thai e-commerce. Focus on revenue optimization and customer analytics.',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/malee-entrepreneur',
          facebook: 'https://facebook.com/thaielectronics'
        },
        createdAt: new Date('2024-03-10').toISOString(),
        lastLoginAt: new Date().toISOString(),
        passwordHash: await this.hashPassword('Seller123!')
      },
      {
        id: 'user_analyst_004',
        email: 'analyst@datacorp.th',
        firstName: 'Krit',
        lastName: 'Analyzer',
        phone: '+66 444-567-890',
        bio: 'Data analyst helping Thai e-commerce businesses optimize their operations through advanced analytics and insights.',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/krit-analyzer',
          twitter: 'https://twitter.com/kritdata'
        },
        createdAt: new Date('2024-04-20').toISOString(),
        lastLoginAt: new Date().toISOString(),
        passwordHash: await this.hashPassword('Analyst123!')
      }
    ];

    this.saveUsers(mockUsers);
    console.log('Mock users initialized successfully');
  }

  /**
   * Get mock user credentials for easy testing
   */
  static getMockUserCredentials(): Array<{ email: string; password: string; role: string }> {
    return [
      {
        email: 'admin@miniseller.com',
        password: 'Admin123!',
        role: 'Administrator'
      },
      {
        email: 'demo@shopowner.com',
        password: 'Demo123!',
        role: 'Shop Owner'
      },
      {
        email: 'seller@thaistore.co.th',
        password: 'Seller123!',
        role: 'Seller'
      },
      {
        email: 'analyst@datacorp.th',
        password: 'Analyst123!',
        role: 'Data Analyst'
      }
    ];
  }

  /**
   * Create authentication session
   */
  private static createSession(user: User, rememberMe: boolean = false): AuthSession {
    const duration = rememberMe ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT;
    
    return {
      user,
      accessToken: this.generateToken(),
      refreshToken: this.generateToken(),
      expiresAt: Date.now() + duration,
      rememberMe,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Save session to storage and set cookie for server-side access
   */
  private static saveSession(session: AuthSession): void {
    try {
      // Save to localStorage for client-side access
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      
      // Set cookie for server-side middleware access
      const expirationDate = new Date(session.expiresAt);
      document.cookie = `${STORAGE_KEY}=${session.accessToken}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Failed to save session');
    }
  }

  /**
   * Get current session
   */
  static getCurrentSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const session: AuthSession = JSON.parse(stored);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear session from storage and remove cookie
   */
  static clearSession(): void {
    try {
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      
      // Clear cookie by setting it to expire immediately
      document.cookie = `${STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if session is valid
   */
  static isSessionValid(): boolean {
    const session = this.getCurrentSession();
    return session !== null && Date.now() < session.expiresAt;
  }

  /**
   * Refresh session if valid
   */
  static async refreshSession(): Promise<boolean> {
    const currentSession = this.getCurrentSession();
    if (!currentSession) return false;

    try {
      // Extend session expiration
      const duration = currentSession.rememberMe 
        ? SESSION_DURATION.REMEMBER_ME 
        : SESSION_DURATION.DEFAULT;
      
      const refreshedSession: AuthSession = {
        ...currentSession,
        expiresAt: Date.now() + duration,
        accessToken: this.generateToken(), // Generate new access token
      };

      this.saveSession(refreshedSession);
      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
  }

  /**
   * Register new user
   */
  static async register(credentials: RegisterCredentials): Promise<{ success: boolean; error?: AuthError; user?: User }> {
    try {
      const { firstName, lastName, email, password, agreeToTerms } = credentials;

      // Validation
      if (!firstName.trim() || !lastName.trim()) {
        return { success: false, error: 'INVALID_CREDENTIALS' };
      }

      if (!this.isValidEmail(email)) {
        return { success: false, error: 'INVALID_EMAIL' };
      }

      const passwordValidation = this.isValidPassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: 'WEAK_PASSWORD' };
      }

      if (!agreeToTerms) {
        return { success: false, error: 'INVALID_CREDENTIALS' };
      }

      // Check if user already exists
      if (this.findUserByEmail(email)) {
        return { success: false, error: 'USER_EXISTS' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create user
      const user: User = {
        id: this.generateUserId(),
        email: email.toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        createdAt: new Date().toISOString(),
      };

      // Save user
      const users = this.getStoredUsers();
      users.push({ ...user, passwordHash });
      this.saveUsers(users);

      return { success: true, user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'UNKNOWN_ERROR' };
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: AuthError; session?: AuthSession }> {
    try {
      // Initialize mock users if none exist (for development/demo)
      await this.initializeMockUsers();

      const { email, password, rememberMe = false } = credentials;

      // Validation
      if (!this.isValidEmail(email) || !password) {
        return { success: false, error: 'INVALID_CREDENTIALS' };
      }

      // Find user
      const userWithPassword = this.findUserByEmail(email);
      if (!userWithPassword) {
        return { success: false, error: 'INVALID_CREDENTIALS' };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, userWithPassword.passwordHash);
      if (!isPasswordValid) {
        return { success: false, error: 'INVALID_CREDENTIALS' };
      }

      // Update last login
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userWithPassword.id);
      if (userIndex !== -1) {
        users[userIndex].lastLoginAt = new Date().toISOString();
        this.saveUsers(users);
      }

      // Create user object without password hash
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...user } = userWithPassword;
      user.lastLoginAt = new Date().toISOString();

      // Create and save session
      const session = this.createSession(user, rememberMe);
      this.saveSession(session);

      return { success: true, session };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'UNKNOWN_ERROR' };
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    this.clearSession();
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: Partial<User>): Promise<{ success: boolean; error?: AuthError; user?: User }> {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, error: 'USER_NOT_FOUND' };
      }

      // Validate email if being updated
      if (updateData.email && !this.isValidEmail(updateData.email)) {
        return { success: false, error: 'INVALID_EMAIL' };
      }

      // Check if email is already taken by another user
      if (updateData.email) {
        const existingUser = this.findUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          return { success: false, error: 'USER_EXISTS' };
        }
      }

      // Update user
      const updatedUser = { 
        ...users[userIndex], 
        ...updateData,
        email: updateData.email?.toLowerCase() || users[userIndex].email 
      };
      users[userIndex] = updatedUser;
      this.saveUsers(users);

      // Update session if exists
      const currentSession = this.getCurrentSession();
      if (currentSession && currentSession.user.id === userId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = updatedUser;
        const updatedSession = {
          ...currentSession,
          user: userWithoutPassword
        };
        this.saveSession(updatedSession);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'UNKNOWN_ERROR' };
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const userWithPassword = this.findUserById(userId);
      if (!userWithPassword) {
        return { success: false, error: 'USER_NOT_FOUND' };
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, userWithPassword.passwordHash);
      if (!isCurrentPasswordValid) {
        return { success: false, error: 'INVALID_CREDENTIALS' };
      }

      // Validate new password
      const passwordValidation = this.isValidPassword(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, error: 'WEAK_PASSWORD' };
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].passwordHash = newPasswordHash;
        this.saveUsers(users);
      }

      return { success: true };
    } catch (error) {
      console.error('Password change failed:', error);
      return { success: false, error: 'UNKNOWN_ERROR' };
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, error: 'USER_NOT_FOUND' };
      }

      // Remove user
      users.splice(userIndex, 1);
      this.saveUsers(users);

      // Clear session
      this.clearSession();

      return { success: true };
    } catch (error) {
      console.error('Account deletion failed:', error);
      return { success: false, error: 'UNKNOWN_ERROR' };
    }
  }

  /**
   * Get user by ID (without password hash)
   */
  static getUserById(userId: string): User | null {
    const userWithPassword = this.findUserById(userId);
    if (!userWithPassword) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...user } = userWithPassword;
    return user;
  }

  /**
   * Get session info
   */
  static getSessionInfo(): { expiresAt: number; rememberMe: boolean } | null {
    const session = this.getCurrentSession();
    return session ? { expiresAt: session.expiresAt, rememberMe: session.rememberMe } : null;
  }

  /**
   * Clear all user data (for development/testing)
   */
  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USERS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }
}
