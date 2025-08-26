import { formidable } from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Disable Vercel's default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const promptText = fields.prompt[0];
    const imageFile = files.image[0];

    const formData = new FormData();
    formData.append('prompt', promptText);
    formData.append('model', 'gpt-image-1');
    formData.append('image', fs.createReadStream(imageFile.filepath), imageFile.originalFilename);
    // Explicitly request the b64_json format
    formData.append('response_format', 'b64_json'); 

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
