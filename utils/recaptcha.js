const axios = require('axios');

/**
 * Validate reCAPTCHA token with Google's API
 * @param {string} token - The reCAPTCHA token from frontend
 * @param {string} remoteip - The user's IP address (optional)
 * @returns {Promise<{success: boolean, message: string, score?: number}>}
 */
async function validateRecaptcha(token, remoteip = null) {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return {
        success: false,
        message: 'reCAPTCHA validation is not configured'
      };
    }

    if (!token) {
      return {
        success: false,
        message: 'reCAPTCHA token is required'
      };
    }

    // Google reCAPTCHA verification endpoint
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);

    if (remoteip) {
      params.append('remoteip', remoteip);
    }

    const response = await axios.post(verifyUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;

    if (data.success) {
      return {
        success: true,
        message: 'reCAPTCHA validation successful',
        score: data.score, // Available for reCAPTCHA v3
        action: data.action // Available for reCAPTCHA v3
      };
    } else {
      console.error('reCAPTCHA validation failed:', data['error-codes']);
      return {
        success: false,
        message: 'reCAPTCHA validation failed',
        errorCodes: data['error-codes']
      };
    }

  } catch (error) {
    console.error('reCAPTCHA validation error:', error);
    return {
      success: false,
      message: 'reCAPTCHA validation service unavailable'
    };
  }
}

/**
 * Express middleware to validate reCAPTCHA
 * @param {boolean} required - Whether reCAPTCHA is required (default: true)
 * @returns {Function} Express middleware function
 */
function recaptchaMiddleware(required = true) {
  return async (req, res, next) => {
    try {
      const recaptchaToken = req.body.recaptchaToken;

      // If reCAPTCHA is not required and no token provided, skip validation
      if (!required && !recaptchaToken) {
        return next();
      }

      const userIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      const result = await validateRecaptcha(recaptchaToken, userIp);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
          errors: [{ field: 'recaptcha', message: result.message }]
        });
      }

      // Add reCAPTCHA result to request object for further use
      req.recaptcha = result;
      next();

    } catch (error) {
      console.error('reCAPTCHA middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'reCAPTCHA validation failed'
      });
    }
  };
}

module.exports = {
  validateRecaptcha,
  recaptchaMiddleware
}; 