const formidable = require('formidable');
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Disable Vercel's default body parser
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error processing upload' });
    }

    try {
      const promptText = fields.prompt;
      const imageFile = files.image;

      const formData = new FormData();
      formData.append('prompt', promptText);
      formData.append('model', 'gpt-image-1');
      formData.append('image', fs.createReadStream(imageFile.filepath), imageFile.originalFilename);
      formData.append('response_format', 'b64_json'); // We want the image data directly

      const openAIResponse = await fetch("https://api.openai.com/v1/images/edits", {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const data = await openAIResponse.json();

      if (!openAIResponse.ok) {
        // If OpenAI returned an error, forward it
        console.error('OpenAI API Error:', data);
        return res.status(openAIResponse.status).json(data);
      }
      
      return res.status(200).json(data);

    } catch (error) {
      console.error('Internal Server Error:', error);
      return res.status(500).json({ error: 'Failed to call OpenAI API' });
    }
  });
};
