const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const OpenAI =require("openai");  
const fs = require('fs');
const path = require('path');

// Express app setup
const app = express();
const PORT = process.env.PORT|| 5000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Replace '*' with your frontend's domain if needed
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });



// Endpoint to handle PDF uploads
app.post('/upload', upload.single('pdf'), async (req, res) => {
  const pdfPath = path.join(__dirname, req.file.path);
  const pdfBuffer = fs.readFileSync(pdfPath);

  const api=req.query.api.trim();

  try {

    const openai = new OpenAI({ apiKey: api});

    // Extract text from PDF
    const data = await pdf(pdfBuffer);

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
                role: "user",
                content: "Write a haiku about recursion in programming.",
            },
        ],
    });

    const htmlResume =completion.choices[0].message;

    // Clean up uploaded PDF file
    fs.unlinkSync(pdfPath);

    
    res.json({ html: htmlResume });
    // Send the generated HTML resume back to the frontend
  
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).send('Error generating resume');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
