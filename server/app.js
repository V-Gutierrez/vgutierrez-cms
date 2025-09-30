const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');

// Import utility functions
const cmsUtils = require('./utils/cms-utils');

// Promisify exec for async/await usage
const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use('/admin', express.static(path.join(__dirname, '..', 'public')));
app.use('/data', express.static(path.join(__dirname, '..', 'data')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'data', 'images');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const slugifiedName = cmsUtils.slugifyFilename(name);
    cb(null, `${slugifiedName}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Routes
app.use('/api/blog', require('./routes/blog'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/gallery', require('./routes/gallery'));

// File upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/data/images/${req.file.filename}`;
    res.json({
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Git operations endpoints
app.get('/api/git/status', async (req, res) => {
  try {
    // Check if we're in a git repository
    try {
      await execAsync('git status', { cwd: process.cwd() });
    } catch (error) {
      return res.status(400).json({ error: 'Não é um repositório Git válido' });
    }

    // Check for uncommitted changes
    const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: process.cwd() });
    const hasUncommittedChanges = statusOutput.trim().length > 0;

    // Count different types of changes
    const lines = statusOutput.trim().split('\n').filter(Boolean);
    const fileDetails = {
      modified: lines.filter(line => line.startsWith(' M') || line.startsWith('M ')).length,
      added: lines.filter(line => line.startsWith('A ') || line.startsWith('??')).length,
      deleted: lines.filter(line => line.startsWith(' D') || line.startsWith('D ')).length,
      total: lines.length
    };

    // Check for unpushed commits
    let hasUnpushedCommits = false;
    let commitsAhead = 0;
    let branchStatus = 'up-to-date';

    try {
      const { stdout: branchInfo } = await execAsync('git status --porcelain -b', { cwd: process.cwd() });
      const branchLine = branchInfo.split('\n')[0];

      if (branchLine.includes('[ahead')) {
        hasUnpushedCommits = true;
        const match = branchLine.match(/\[ahead (\d+)\]/);
        commitsAhead = match ? parseInt(match[1]) : 1;
        branchStatus = 'ahead';
      } else if (branchLine.includes('[behind')) {
        branchStatus = 'behind';
      }
    } catch (error) {
      // If there's no remote, we can't check ahead/behind status
      console.log('Could not check remote status:', error.message);
    }

    res.json({
      hasUncommittedChanges,
      hasUnpushedCommits,
      changedFiles: fileDetails.total,
      commitsAhead,
      fileDetails,
      branchStatus
    });

  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({
      error: 'Erro ao verificar status Git',
      details: error.message
    });
  }
});

app.post('/api/git/commit', async (req, res) => {
  try {
    // Check if we're in a git repository
    try {
      await execAsync('git status', { cwd: process.cwd() });
    } catch (error) {
      return res.status(400).json({ error: 'Não é um repositório Git válido' });
    }

    // Check if there are changes to commit
    const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: process.cwd() });

    if (!statusOutput.trim()) {
      return res.json({
        message: 'Nenhuma mudança para commit',
        hasChanges: false
      });
    }

    // Add all changes
    await execAsync('git add .', { cwd: process.cwd() });

    // Create commit with timestamp
    const timestamp = new Date().toLocaleString('pt-BR');
    const commitMessage = `Update content via CMS - ${timestamp}`;

    const { stdout: commitOutput } = await execAsync(
      `git commit -m "${commitMessage}"`,
      { cwd: process.cwd() }
    );

    res.json({
      message: 'Commit realizado com sucesso!',
      details: commitOutput.trim(),
      hasChanges: true,
      commitMessage
    });

  } catch (error) {
    console.error('Git commit error:', error);
    res.status(500).json({
      error: 'Erro ao fazer commit',
      details: error.message
    });
  }
});

app.post('/api/git/push', async (req, res) => {
  try {
    // Check if we're in a git repository
    try {
      await execAsync('git status', { cwd: process.cwd() });
    } catch (error) {
      return res.status(400).json({ error: 'Não é um repositório Git válido' });
    }

    // Check if there are commits to push
    try {
      const { stdout } = await execAsync('git status --porcelain -b', { cwd: process.cwd() });
      const statusLines = stdout.split('\n');
      const branchLine = statusLines.find(line => line.startsWith('##'));

      if (branchLine && branchLine.includes('[ahead')) {
        // There are commits to push
      } else if (branchLine && !branchLine.includes('[')) {
        // Branch is up to date
        return res.json({
          message: 'Repositório já está atualizado',
          upToDate: true
        });
      }
    } catch (error) {
      // Continue with push attempt
    }

    // Get current branch
    const { stdout: branchOutput } = await execAsync('git branch --show-current', { cwd: process.cwd() });
    const currentBranch = branchOutput.trim() || 'main';

    // Push to remote
    const { stdout: pushOutput } = await execAsync(
      `git push origin ${currentBranch}`,
      { cwd: process.cwd(), timeout: 30000 }
    );

    res.json({
      message: 'Push realizado com sucesso!',
      details: pushOutput.trim(),
      branch: currentBranch
    });

  } catch (error) {
    console.error('Git push error:', error);

    // Handle specific Git errors
    let errorMessage = 'Erro ao fazer push';
    if (error.message.includes('no upstream branch')) {
      errorMessage = 'Branch não configurado para push. Configure o upstream primeiro.';
    } else if (error.message.includes('Authentication failed')) {
      errorMessage = 'Falha na autenticação. Verifique suas credenciais Git.';
    } else if (error.message.includes('rejected')) {
      errorMessage = 'Push rejeitado. Faça pull das mudanças remotas primeiro.';
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Default route - redirect to admin interface
app.get('/admin', (req, res) => {
  res.redirect('/admin/');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CMS Server running at http://localhost:${PORT}`);
  console.log(`📝 Admin interface: http://localhost:${PORT}/admin`);
});

module.exports = app;