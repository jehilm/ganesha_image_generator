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
  console.log("Function started, parsing form...");
  
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('[FORM PARSE ERROR]', err);
      return res.status(500).json({ error: 'Failed to parse form data.', details: err.message });
    }

    try {
      console.log("Form parsed successfully. Preparing to call OpenAI.");
      
      const promptText = fields.prompt;
      const imageFile = files.image;

      if (!promptText || !imageFile) {
          console.error('[MISSING DATA] Prompt or image file is missing.');
          return res.status(400).json({ error: 'Missing prompt or image file in the request.' });
      }

      const formData = new FormData();
      formData.append('prompt', promptText);
      formData.append('model', 'gpt-image-1');
      formData.append('image', fs.createReadStream(imageFile.filepath), imageFile.originalFilename);
      formData.append('response_format', 'b64_json');

      console.log("Sending request to OpenAI API...");
      
      const openAIResponse = await fetch("https://api.openai.com/v1/images/edits", {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const responseText = await openAIResponse.text();
      console.log(`OpenAI response status: ${openAIResponse.status}`);

      if (!openAIResponse.ok) {
        console.error('[OPENAI API ERROR]', responseText);
        return res.status(openAIResponse.status).json({ error: 'OpenAI API returned an error.', details: responseText });
      }

      console.log("OpenAI call successful. Sending response to client.");
      const data = JSON.parse(responseText);
      return res.status(200).json(data);

    } catch (error) {
      console.error('[SERVER CATCH ERROR]', error);
      return res.status(500).json({ error: 'An unexpected error occurred on the server.', details: error.message });
    }
  });
};
