// Input validation and sanitization utilities
// Security measures for user input

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  // Trim and lowercase
  const sanitized = email.trim().toLowerCase();
  
  // Email regex pattern
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!sanitized) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Check for PUP email (optional - uncomment if you want to restrict to PUP only)
  // if (!sanitized.endsWith('@iskolarngbayan.pup.edu.ph')) {
  //   return { valid: false, error: 'Please use your PUP email address' };
  // }
  
  return { valid: true };
};

export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  // Trim whitespace
  const sanitized = username.trim();
  
  if (!sanitized) {
    return { valid: false, error: 'Username is required' };
  }
  
  if (sanitized.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (sanitized.length > 20) {
    return { valid: false, error: 'Username must be less than 20 characters' };
  }
  
  // Allow only alphanumeric, underscore, and hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(sanitized)) {
    return { valid: false, error: 'Username can only contain letters, numbers, _ and -' };
  }
  
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

export const validateDepartment = (department: string): { valid: boolean; error?: string } => {
  const validDepartments = [
    'College of Engineering',
    'College of Computer and Information Sciences',
    'College of Business Administration',
    'College of Education',
    'College of Science',
    'College of Social Sciences and Development',
    'College of Liberal Arts',
    'College of Architecture, Design and the Built Environment',
    'College of Tourism, Hospitality and Transportation Management',
    'College of Communication',
    'Other',
  ];
  
  if (!department) {
    return { valid: false, error: 'Please select a department' };
  }
  
  if (!validDepartments.includes(department)) {
    return { valid: false, error: 'Invalid department selected' };
  }
  
  return { valid: true };
};

// Sanitize HTML to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 100); // Limit length
};

// Rate limiting helper (client-side basic check)
const attemptTracker: { [key: string]: number[] } = {};

export const checkRateLimit = (identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  
  if (!attemptTracker[identifier]) {
    attemptTracker[identifier] = [];
  }
  
  // Remove old attempts outside the window
  attemptTracker[identifier] = attemptTracker[identifier].filter(
    timestamp => now - timestamp < windowMs
  );
  
  // Check if exceeded max attempts
  if (attemptTracker[identifier].length >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  // Add current attempt
  attemptTracker[identifier].push(now);
  return true; // Allowed
};
