// Backend for handling ONLY quote form submissions and sending emails
// Install dependencies: npm install express nodemailer multer cors

const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update these with your iCloud email credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.me.com',
  port: 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: 'brandon.tuffery@icloud.com', // your full iCloud email address
    pass: 'suqf-kdgc-peeq-tvld' // your app-specific password
  }
});

// Quote form endpoint (with file upload)
app.post('/api/quote', upload.array('referenceFiles'), async (req, res) => {
  try {
    const { body, files } = req;
    console.log('Received quote form:', body);
    console.log('Received files:', files);
    const mailOptions = {
      from: 'brandon.tuffery@icloud.com',
      to: 'brandon.tuffery@icloud.com',
      subject: 'New Quote Request from NovaWeb Creations',
      text: `Name: ${body.name || ''}\nEmail: ${body.email || ''}\nBusiness/Website: ${body.business || ''}\nBudget: ${body.budget || ''}\n\nProject Details:\n${body.details || ''}`,
      attachments: Array.isArray(files) && files.length > 0 ? files.map(file => ({
        filename: file.originalname,
        path: file.path
      })) : []
    };
    await transporter.sendMail(mailOptions);
    // Clean up uploaded files if any
    if (Array.isArray(files)) {
      files.forEach(file => fs.unlink(file.path, () => {}));
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Quote form email send error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3002; // Use a different port for this server
app.listen(PORT, () => {
  console.log(`Quote server running on http://localhost:${PORT}`);
});
