export function validateEmail(email: string): string | undefined {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return undefined;
}

export function validatePhone(phone: string): string | undefined {
  if (!phone || !phone.trim()) {
    return 'Phone number is required.';
  }
  const phoneClean = phone.replace(/[\s\-\(\)\+]/g, '');
  if (phoneClean.length < 10) {
    return 'Please enter a valid 10-digit phone number.';
  }
  return undefined;
}
