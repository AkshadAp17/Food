import { storage } from './mongoStorage.js';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'akshadapastambh37@gmail.com';

export async function isAdmin(email: string): Promise<boolean> {
  return email === ADMIN_EMAIL;
}

export async function createAdminIfNotExists(): Promise<void> {
  try {
    const existingAdmin = await storage.getUserByEmail(ADMIN_EMAIL);
    if (!existingAdmin) {
      await storage.createUser({
        email: ADMIN_EMAIL,
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin123', // Will be hashed
        phone: '',
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

export async function authenticateAdmin(email: string, password: string): Promise<boolean> {
  if (!isAdmin(email)) {
    return false;
  }
  
  const user = await storage.getUserByEmail(email);
  if (!user) {
    return false;
  }
  
  return await storage.verifyPassword(password, user.password);
}