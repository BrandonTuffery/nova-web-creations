// Backend for handling quote form submissions and sending emails
// Install dependencies: npm install express nodemailer multer cors

const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
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

// Contact form endpoint (no file upload)
app.post('/api/contact', multer().none(), async (req, res) => {
  try {
    console.log('POST /api/contact endpoint hit');
    const { name, email, business, details } = req.body;
    console.log('Received contact form:', req.body);
    const mailOptions = {
      from: 'brandon.tuffery@icloud.com',
      to: 'brandon.tuffery@icloud.com',
      subject: 'New Contact Message from NovaWeb Creations',
      text: `Name: ${name || ''}\nEmail: ${email || ''}\nBusiness/Website: ${business || ''}\n\nMessage:\n${details || ''}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Contact form email send error:', error);
        if (error.response) {
          console.error('SMTP response:', error.response);
        }
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log('Email sent:', info.response);
      res.json({ success: true });
    });
  } catch (err) {
    console.error('Contact form email send error (outer catch):', err);
    res.status(500).json({ success: false, error: err.message });
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
