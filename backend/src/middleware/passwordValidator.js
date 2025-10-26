// Common weak passwords to check against
const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'qwerty123', 'dragon', 'master', 'hello', 'freedom', 'whatever',
    'qazwsx', 'trustno1', 'jordan23', 'harley', 'password1', 'welcome123',
    'login', 'admin123', 'princess', 'qwertyuiop', 'solo', 'passw0rd',
    'starwars', 'sunshine', 'iloveyou', 'asshole', '000000', 'football',
    'jordan', 'superman', 'michael', 'mustang', 'shadow', 'merlin',
    'dragon', 'master', 'hello', 'freedom', 'whatever', 'qazwsx',
    'trustno1', 'jordan23', 'harley', 'password1', 'welcome123'
];

// Password strength validation middleware
export const validatePasswordStrength = (req, res, next) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({
            error: 'Password is required',
            validation: {
                passed: false,
                errors: ['Password is required']
            }
        });
    }

    const errors = [];
    const warnings = [];
    let score = 0;

    // Length check (minimum 8 characters)
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    } else if (password.length >= 12) {
        score += 2;
    } else {
        score += 1;
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else {
        score += 1;
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else {
        score += 1;
    }

    // Number check
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    } else {
        score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        warnings.push('Consider adding special characters for better security');
    } else {
        score += 2;
    }

    // Common password check
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common and easily guessable');
    }

    // Sequential characters check
    if (/(.)\1{2,}/.test(password)) {
        warnings.push('Avoid repeating characters (e.g., aaa, 111)');
    }

    // Sequential patterns check
    if (/123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
        warnings.push('Avoid sequential patterns (e.g., 123, abc)');
    }

    // Keyboard patterns check
    const keyboardPatterns = [
        'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
        'qwertyuiopasdfghjklzxcvbnm'
    ];
    
    for (const pattern of keyboardPatterns) {
        if (password.toLowerCase().includes(pattern)) {
            warnings.push('Avoid keyboard patterns (e.g., qwerty, asdf)');
            break;
        }
    }

    // Personal information check (basic)
    const email = req.body.email;
    if (email) {
        const emailUsername = email.split('@')[0];
        if (password.toLowerCase().includes(emailUsername.toLowerCase())) {
            warnings.push('Avoid using your email username in your password');
        }
    }

    // Calculate strength level
    let strength = 'weak';
    if (score >= 6) {
        strength = 'strong';
    } else if (score >= 4) {
        strength = 'medium';
    }

    // If there are critical errors, reject the password
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Password does not meet security requirements',
            validation: {
                passed: false,
                strength,
                score,
                errors,
                warnings,
                requirements: {
                    minLength: 8,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSpecialChars: false
                }
            }
        });
    }

    // Add validation info to request for logging/monitoring
    req.passwordValidation = {
        passed: true,
        strength,
        score,
        warnings,
        length: password.length
    };

    next();
};

// Password strength checker endpoint (for frontend to use)
export const checkPasswordStrength = (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({
            error: 'Password is required for strength check'
        });
    }

    const errors = [];
    const warnings = [];
    let score = 0;

    // Same validation logic as above but without blocking
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    } else if (password.length >= 12) {
        score += 2;
    } else {
        score += 1;
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else {
        score += 1;
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else {
        score += 1;
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    } else {
        score += 1;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        warnings.push('Consider adding special characters for better security');
    } else {
        score += 2;
    }

    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common and easily guessable');
    }

    if (/(.)\1{2,}/.test(password)) {
        warnings.push('Avoid repeating characters (e.g., aaa, 111)');
    }

    if (/123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
        warnings.push('Avoid sequential patterns (e.g., 123, abc)');
    }

    let strength = 'weak';
    if (score >= 6) {
        strength = 'strong';
    } else if (score >= 4) {
        strength = 'medium';
    }

    res.json({
        validation: {
            passed: errors.length === 0,
            strength,
            score,
            errors,
            warnings,
            requirements: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: false
            }
        }
    });
};
