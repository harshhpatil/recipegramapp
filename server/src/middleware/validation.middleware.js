/**
 * Validation middleware for input validation
 */

export const validatePost = (req, res, next) => {
  const { caption, image } = req.body;

  if (!caption || caption.trim().length === 0) {
    return res.status(400).json({ 
      success: false,
      message: "Caption is required" 
    });
  }

  if (caption.length > 2000) {
    return res.status(400).json({ 
      success: false,
      message: "Caption must be 2000 characters or less" 
    });
  }

  if (!image || image.trim().length === 0) {
    return res.status(400).json({ 
      success: false,
      message: "Image is required" 
    });
  }

  // Validate URL format (basic check)
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlPattern.test(image)) {
    return res.status(400).json({ 
      success: false,
      message: "Image must be a valid URL" 
    });
  }

  next();
};

export const validatePostUpdate = (req, res, next) => {
  const { caption, image } = req.body;

  if (caption !== undefined) {
    if (caption.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Caption cannot be empty" 
      });
    }

    if (caption.length > 2000) {
      return res.status(400).json({ 
        success: false,
        message: "Caption must be 2000 characters or less" 
      });
    }
  }

  if (image !== undefined) {
    if (image.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Image cannot be empty" 
      });
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(image)) {
      return res.status(400).json({ 
        success: false,
        message: "Image must be a valid URL" 
      });
    }
  }

  next();
};

export const validateComment = (req, res, next) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ 
      success: false,
      message: "Comment text is required" 
    });
  }

  if (text.length > 500) {
    return res.status(400).json({ 
      success: false,
      message: "Comment must be 500 characters or less" 
    });
  }

  next();
};

export const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  // Username validation
  if (!username || username.trim().length === 0) {
    return res.status(400).json({ 
      success: false,
      message: "Username is required" 
    });
  }

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ 
      success: false,
      message: "Username must be between 3 and 30 characters" 
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ 
      success: false,
      message: "Username can only contain letters, numbers, and underscores" 
    });
  }

  // Email validation
  if (!email || email.trim().length === 0) {
    return res.status(400).json({ 
      success: false,
      message: "Email is required" 
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid email format" 
    });
  }

  // Password validation
  if (!password || password.trim().length === 0) {
    return res.status(400).json({ 
      success: false,
      message: "Password is required" 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: "Password must be at least 6 characters long" 
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim().length === 0) {
    return res.status(400).json({ 
      success: false,
      message: "Email is required" 
    });
  }

  if (!password || password.trim().length === 0) {
    return res.status(400).json({ 
      success: false,
      message: "Password is required" 
    });
  }

  next();
};
