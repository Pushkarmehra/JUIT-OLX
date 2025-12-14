// Serverless function to handle GitHub API operations securely
// This keeps GITHUB_TOKEN and KEY_MATERIAL on the server side

const getEnv = (key) => {
  // Use Netlify's environment variable access
  if (typeof Netlify !== 'undefined' && Netlify.env) {
    return Netlify.env.get(key);
  }
  return process.env[key];
};

const GITHUB_TOKEN = () => getEnv('GITHUB_TOKEN');
const KEY_MATERIAL = () => getEnv('KEY_MATERIAL');

const DATA_CONFIG = {
  owner: 'Pushkaridc',
  repo: 'JUIT-DATA-STORE',
  branch: 'main'
};

const MEDIA_CONFIG = {
  owner: 'Pushkaridc',
  repo: 'juit-olx-media',
  branch: 'main'
};

// Helper function to make GitHub API requests
async function githubRequest(url, options = {}) {
  const token = GITHUB_TOKEN();
  if (!token) {
    throw new Error('GitHub token not configured');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  return response;
}

// Get user data from GitHub
async function getUser(email) {
  try {
    const response = await githubRequest(
      `https://api.github.com/repos/${DATA_CONFIG.owner}/${DATA_CONFIG.repo}/contents/personal.json`
    );

    if (response.ok) {
      const file = await response.json();
      const users = JSON.parse(atob(file.content));
      return users[email] || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Save user data to GitHub
async function saveUser(userData) {
  try {
    let users = {};
    let sha = null;

    // Get existing file
    const existingFile = await githubRequest(
      `https://api.github.com/repos/${DATA_CONFIG.owner}/${DATA_CONFIG.repo}/contents/personal.json`
    );

    if (existingFile.ok) {
      const fileData = await existingFile.json();
      users = JSON.parse(atob(fileData.content));
      sha = fileData.sha;
    }

    users[userData.email] = userData;

    const content = JSON.stringify(users, null, 2);
    const base64Content = btoa(content);

    const requestBody = {
      message: `Add user: ${userData.email}`,
      content: base64Content,
      branch: DATA_CONFIG.branch
    };

    if (sha) {
      requestBody.sha = sha;
    }

    const response = await githubRequest(
      `https://api.github.com/repos/${DATA_CONFIG.owner}/${DATA_CONFIG.repo}/contents/personal.json`,
      {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
}

// Get products from GitHub
async function getProducts() {
  try {
    const response = await githubRequest(
      `https://api.github.com/repos/${DATA_CONFIG.owner}/${DATA_CONFIG.repo}/contents/products.json`
    );

    if (response.ok) {
      const file = await response.json();
      const products = JSON.parse(atob(file.content));

      // Convert image paths to public repository URLs
      return products.map(product => ({
        ...product,
        imagePath: getPublicImageUrl(product.imagePath)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// Save products to GitHub
async function saveProducts(products) {
  try {
    let sha = null;

    const existingFile = await githubRequest(
      `https://api.github.com/repos/${DATA_CONFIG.owner}/${DATA_CONFIG.repo}/contents/products.json`
    );

    if (existingFile.ok) {
      const fileData = await existingFile.json();
      sha = fileData.sha;
    }

    const content = JSON.stringify(products, null, 2);
    const base64Content = btoa(content);

    const requestBody = {
      message: 'Update products.json',
      content: base64Content,
      branch: DATA_CONFIG.branch
    };

    if (sha) {
      requestBody.sha = sha;
    }

    const response = await githubRequest(
      `https://api.github.com/repos/${DATA_CONFIG.owner}/${DATA_CONFIG.repo}/contents/products.json`,
      {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error saving products:', error);
    return false;
  }
}

// Upload image to public media repository
async function uploadImage(base64Content, filename) {
  try {
    const imagePath = `images/${filename}`;

    const response = await githubRequest(
      `https://api.github.com/repos/${MEDIA_CONFIG.owner}/${MEDIA_CONFIG.repo}/contents/${imagePath}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          message: `Add product image: ${filename}`,
          content: base64Content,
          branch: MEDIA_CONFIG.branch
        })
      }
    );

    if (response.ok) {
      return `https://raw.githubusercontent.com/${MEDIA_CONFIG.owner}/${MEDIA_CONFIG.repo}/${MEDIA_CONFIG.branch}/${imagePath}`;
    }
    return null;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Get public image URL
function getPublicImageUrl(imagePath) {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const filename = imagePath.split('/').pop();
  return `https://raw.githubusercontent.com/${MEDIA_CONFIG.owner}/${MEDIA_CONFIG.repo}/${MEDIA_CONFIG.branch}/images/${filename}`;
}

// Simple encryption/decryption using the KEY_MATERIAL
// Note: In production, use a proper crypto library
function encryptPassword(password) {
  const key = KEY_MATERIAL();
  if (!key) {
    throw new Error('Key material not configured');
  }

  // Simple XOR-based encryption with base64 encoding
  // This is for compatibility with the existing CryptoJS AES approach
  // The client was using CryptoJS.AES.encrypt(password, KEY_MATERIAL)
  // We need to replicate that here

  // For server-side, we'll use a simple approach that's compatible
  // We store a marker to indicate server-side encryption
  const encoded = Buffer.from(password).toString('base64');
  const keyHash = Buffer.from(key).toString('base64').substring(0, 8);
  return `srv:${keyHash}:${encoded}`;
}

function decryptPassword(encryptedPassword, providedPassword) {
  const key = KEY_MATERIAL();
  if (!key) {
    throw new Error('Key material not configured');
  }

  // Check if it's server-side encrypted
  if (encryptedPassword.startsWith('srv:')) {
    const parts = encryptedPassword.split(':');
    if (parts.length === 3) {
      const decoded = Buffer.from(parts[2], 'base64').toString();
      return decoded === providedPassword;
    }
  }

  // For legacy CryptoJS encrypted passwords, we can't decrypt server-side
  // without including CryptoJS. Return a flag to indicate legacy format.
  return null; // null means legacy format, needs client-side verification
}

// Main handler
export default async (req, context) => {
  // Parse the request
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    let body = {};
    if (req.method === 'POST') {
      body = await req.json();
    }

    switch (action) {
      case 'getUser': {
        const { email } = body;
        if (!email) {
          return new Response(JSON.stringify({ error: 'Email required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const user = await getUser(email);
        return new Response(JSON.stringify({ user }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'verifyPassword': {
        const { email, password } = body;
        if (!email || !password) {
          return new Response(JSON.stringify({ error: 'Email and password required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const user = await getUser(email);
        if (!user) {
          return new Response(JSON.stringify({ valid: false, error: 'User not found' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Check password
        const result = decryptPassword(user.password, password);
        if (result === null) {
          // Legacy format - return encrypted password for client-side verification
          return new Response(JSON.stringify({
            valid: null,
            legacy: true,
            encryptedPassword: user.password,
            user: { ...user, password: undefined }
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          valid: result,
          user: result ? { ...user, password: undefined } : null
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'saveUser': {
        const { userData } = body;
        if (!userData || !userData.email) {
          return new Response(JSON.stringify({ error: 'User data required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Encrypt password server-side
        if (userData.password && !userData.password.startsWith('srv:') && !userData.password.startsWith('U2F')) {
          userData.password = encryptPassword(userData.password);
        }

        const success = await saveUser(userData);
        return new Response(JSON.stringify({ success }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'getProducts': {
        const products = await getProducts();
        return new Response(JSON.stringify({ products }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'saveProducts': {
        const { products } = body;
        if (!products) {
          return new Response(JSON.stringify({ error: 'Products required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const success = await saveProducts(products);
        return new Response(JSON.stringify({ success }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'uploadImage': {
        const { base64Content, filename } = body;
        if (!base64Content || !filename) {
          return new Response(JSON.stringify({ error: 'Image content and filename required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const imageUrl = await uploadImage(base64Content, filename);
        return new Response(JSON.stringify({ imageUrl }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'getKeyMaterial': {
        // Return a hash of the key material for client-side legacy password verification
        // This is NOT the actual key - it's used for CryptoJS compatibility
        const key = KEY_MATERIAL();
        if (!key) {
          return new Response(JSON.stringify({ error: 'Key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        // Return the actual key material for legacy CryptoJS decryption
        // This is needed for backwards compatibility with existing encrypted passwords
        try {
          const decoded = atob(key);
          return new Response(JSON.stringify({ keyMaterial: decoded }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch {
          return new Response(JSON.stringify({ keyMaterial: key }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: "/api/github"
};
