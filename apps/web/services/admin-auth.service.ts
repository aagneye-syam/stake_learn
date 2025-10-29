/**
 * Admin authentication service
 * Handles admin login with hardcoded credentials from environment
 */

export interface AdminUser {
  email: string;
  isAuthenticated: boolean;
}

/**
 * Admin login function
 * Validates credentials against environment variables
 */
export async function adminLogin(email: string, password: string): Promise<AdminUser | null> {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // Validate credentials
  if (email === adminEmail && password === adminPassword) {
    const adminUser: AdminUser = {
      email: adminEmail!,
      isAuthenticated: true
    };
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminAuth', JSON.stringify(adminUser));
    }
    
    return adminUser;
  }

  return null;
}

/**
 * Check if admin is currently authenticated
 */
export function isAdminAuthenticated(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('adminAuth');
    if (stored) {
      const adminUser = JSON.parse(stored) as AdminUser;
      return adminUser.isAuthenticated ? adminUser : null;
    }
  } catch (error) {
    console.error('Error checking admin auth:', error);
  }
  
  return null;
}

/**
 * Admin logout function
 */
export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminAuth');
  }
}