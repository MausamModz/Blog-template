// File: netlify/functions/upload.js

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Hardcoded repository details
  const user = 'anaroulhasan';
  const repo = 'themestash';
  
  // Get data from the request
  const { fileName, fileContent } = JSON.parse(event.body);
  
  // Securely get the token from environment variables
  const GITHUB_TOKEN = process.env.VITE_GITHUB_TOKEN;

  if (!GITHUB_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Server Error: GitHub token is not configured.' }) };
  }

  const url = `https://api.github.com/repos/${user}/${repo}/contents/${fileName}`;

  try {
    // Check if the file already exists to get its SHA (for updating)
    let sha = null;
    const existingFileRes = await fetch(url, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });
    if (existingFileRes.ok) {
      const fileData = await existingFileRes.json();
      sha = fileData.sha;
    }

    // Request to upload the file to GitHub
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `feat: add ${fileName} via generator`,
        content: fileContent,
        sha: sha // Include SHA if updating an existing file
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { statusCode: response.status, body: JSON.stringify({ message: `GitHub API Error: ${errorData.message}` }) };
    }

    const data = await response.json();
    // Return the direct download URL for the file
    return {
      statusCode: 200,
      body: JSON.stringify({ download_url: data.content.download_url }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
