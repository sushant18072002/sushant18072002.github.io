// Form validation utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidator {
  private rules: Record<string, ValidationRule> = {};

  addRule(field: string, rule: ValidationRule): FormValidator {
    this.rules[field] = rule;
    return this;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];
      const error = this.validateField(value, rule);
      
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private validateField(value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return 'This field is required';
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `Must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `Must be no more than ${rule.maxLength} characters`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return 'Invalid format';
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }
}

// Common validation patterns
export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  AIRPORT_CODE: /^[A-Z]{3}$/,
} as const;

// Pre-built validators
export const createTripFormValidator = () => {
  return new FormValidator()
    .addRule('destination', { required: true, minLength: 2 })
    .addRule('departDate', { required: true, pattern: ValidationPatterns.DATE })
    .addRule('travelers', { required: true })
    .addRule('budget', { required: true });
};

export const createFlightFormValidator = () => {
  return new FormValidator()
    .addRule('from', { required: true, minLength: 2 })
    .addRule('to', { required: true, minLength: 2 })
    .addRule('departDate', { required: true, pattern: ValidationPatterns.DATE })
    .addRule('passengers', { 
      required: true, 
      custom: (value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 9) {
          return 'Passengers must be between 1 and 9';
        }
        return null;
      }
    });
};

export const createHotelFormValidator = () => {
  return new FormValidator()
    .addRule('location', { required: true, minLength: 2 })
    .addRule('checkIn', { required: true, pattern: ValidationPatterns.DATE })
    .addRule('checkOut', { required: true, pattern: ValidationPatterns.DATE })
    .addRule('guests', { 
      required: true, 
      custom: (value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 20) {
          return 'Guests must be between 1 and 20';
        }
        return null;
      }
    });
};