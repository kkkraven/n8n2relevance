const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const AWS = require('aws-sdk');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Initialize D1 (SQLite) database
const db = new sqlite3.Database('d1.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS conversions (
    id TEXT PRIMARY KEY,
    original_name TEXT,
    archive_name TEXT,
    created_at TEXT
  )`);
});

// Configure R2 (S3-compatible)
let r2;
let r2Bucket;
if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT && process.env.R2_BUCKET) {
  r2 = new AWS.S3({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    endpoint: process.env.R2_ENDPOINT,
    s3ForcePathStyle: true, // needed for R2
    signatureVersion: 'v4',
  });
  r2Bucket = process.env.R2_BUCKET;
}

// Helper to validate JSON structure
function validateJson(data) {
  return data && typeof data.name === 'string' && data.data !== undefined;
}

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File missing' });
  }

  const filePath = req.file.path;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    if (!validateJson(data)) {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    const id = uuidv4();
    const archiveName = `${id}.rai`;
    const archivePath = path.join('archives', archiveName);

    // Create .rai archive (zip of original JSON)
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(archivePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.append(content, { name: req.file.originalname });
      archive.finalize();
    });

    // Store metadata in D1
    db.run(`INSERT INTO conversions (id, original_name, archive_name, created_at) VALUES (?, ?, ?, datetime('now'))`,
      [id, req.file.originalname, archiveName]);

    let uploadResult;
    if (r2) {
      const fileStream = fs.createReadStream(archivePath);
      const params = { Bucket: r2Bucket, Key: archiveName, Body: fileStream };
      uploadResult = await r2.upload(params).promise();
    }

    res.json({ id, archive: archiveName, uploaded: !!uploadResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Conversion failed' });
  } finally {
    fs.unlinkSync(filePath);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
