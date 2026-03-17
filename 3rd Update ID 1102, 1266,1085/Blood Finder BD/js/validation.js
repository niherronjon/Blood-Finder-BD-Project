// validation.js - Comprehensive Form Validation
class ValidationController {
    constructor() {
        this.rules = {
            required: (value) => value && value.trim() !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^(\+88)?01[3-9]\d{8}$/.test(value),
            bloodGroup: (value) => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(value),
            minLength: (min) => (value) => value && value.length >= min,
            maxLength: (max) => (value) => value && value.length <= max,
            numeric: (value) => !isNaN(value) && isFinite(value),
            minValue: (min) => (value) => parseFloat(value) >= min,
            maxValue: (max) => (value) => parseFloat(value) <= max,
            date: (value) => !isNaN(Date.parse(value)),
            futureDate: (value) => new Date(value) > new Date(),
            pastDate: (value) => new Date(value) < new Date()
        };

        this.messages = {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            phone: 'Please enter a valid Bangladesh phone number (+8801XXXXXXXXX)',
            bloodGroup: 'Please select a valid blood group',
            minLength: (min) => `Minimum ${min} characters required`,
            maxLength: (max) => `Maximum ${max} characters allowed`,
            numeric: 'Please enter a valid number',
            minValue: (min) => `Value must be at least ${min}`,
            maxValue: (max) => `Value must be at most ${max}`,
            date: 'Please enter a valid date',
            futureDate: 'Date must be in the future',
            pastDate: 'Date must be in the past'
        };
    }

    validateField(value, rules) {
        const errors = [];

        for (const rule of rules) {
            if (typeof rule === 'string') {
                if (!this.rules[rule](value)) {
                    errors.push(this.messages[rule]);
                }
            } else if (typeof rule === 'object') {
                const ruleName = rule.rule;
                const ruleValue = rule.value;

                if (!this.rules[ruleName](ruleValue)(value)) {
                    errors.push(typeof this.messages[ruleName] === 'function' ?
                        this.messages[ruleName](ruleValue) :
                        this.messages[ruleName]);
                }
            }
        }

        return errors;
    }

    validateForm(formData, validationRules) {
        const errors = {};

        for (const field in validationRules) {
            const fieldErrors = this.validateField(formData[field], validationRules[field]);
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        }

        return errors;
    }

    showFieldError(fieldId, errors) {
        const field = document.getElementById(fieldId);
        const errorContainer = document.getElementById(fieldId + '-error') ||
            this.createErrorContainer(fieldId);

        if (errors.length > 0) {
            field.classList.add('is-invalid');
            errorContainer.textContent = errors[0];
            errorContainer.style.display = 'block';
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            errorContainer.style.display = 'none';
        }
    }

    createErrorContainer(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.createElement('div');
        errorDiv.id = fieldId + '-error';
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
        return errorDiv;
    }

    validateRegistrationForm() {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            phone: document.getElementById('phone').value,
            bloodGroup: document.getElementById('bloodGroup').value,
            userType: document.getElementById('userType').value,
            district: document.getElementById('district').value,
            weight: document.getElementById('weight').value
        };

        const rules = {
            name: ['required', { rule: 'minLength', value: 2 }],
            email: ['required', 'email'],
            password: ['required', { rule: 'minLength', value: 6 }],
            phone: ['required', 'phone'],
            bloodGroup: ['required', 'bloodGroup'],
            userType: ['required'],
            district: ['required']
        };

        // Add donor-specific validation
        if (formData.userType === 'donor') {
            rules.weight = ['required', 'numeric', { rule: 'minValue', value: 50 }];
        }

        const errors = this.validateForm(formData, rules);

        // Check password confirmation
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = ['Passwords do not match'];
        }

        // Show errors
        for (const field in rules) {
            this.showFieldError(field, errors[field] || []);
        }

        if (errors.confirmPassword) {
            this.showFieldError('confirmPassword', errors.confirmPassword);
        }

        return Object.keys(errors).length === 0;
    }

    validateBloodRequestForm() {
        const formData = {
            patientName: document.getElementById('patientName').value,
            bloodGroup: document.getElementById('requestBloodGroup').value,
            unitsNeeded: document.getElementById('unitsNeeded').value,
            urgency: document.getElementById('urgency').value,
            hospitalName: document.getElementById('hospitalName').value,
            contactPerson: document.getElementById('contactPerson').value,
            contactPhone: document.getElementById('contactPhone').value,
            requiredDate: document.getElementById('requiredDate').value
        };

        const rules = {
            patientName: ['required', { rule: 'minLength', value: 2 }],
            bloodGroup: ['required', 'bloodGroup'],
            unitsNeeded: ['required', 'numeric', { rule: 'minValue', value: 1 }, { rule: 'maxValue', value: 10 }],
            urgency: ['required'],
            hospitalName: ['required'],
            contactPerson: ['required'],
            contactPhone: ['required', 'phone'],
            requiredDate: ['required', 'date', 'futureDate']
        };

        const errors = this.validateForm(formData, rules);

        // Show errors
        for (const field in rules) {
            this.showFieldError(field, errors[field] || []);
        }

        return Object.keys(errors).length === 0;
    }

    // Real-time validation setup
    setupRealTimeValidation(formId, validationRules) {
        const form = document.getElementById(formId);
        if (!form) return;

        for (const fieldName in validationRules) {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => {
                    const errors = this.validateField(field.value, validationRules[fieldName]);
                    this.showFieldError(fieldName, errors);
                });
            }
        }
    }
}

// Initialize validation controller
document.addEventListener('DOMContentLoaded', function() {
    window.validator = new ValidationController();
});