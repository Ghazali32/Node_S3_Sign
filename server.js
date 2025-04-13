require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: 'https://s3.eu-west-2.amazonaws.com',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

app.post('/api/get-converted-presigned-url', async (req, res) => {
  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ error: 'fileName is required' });
  }

  try {
    const key = `converted/${fileName}`;
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60s expiry
    console.log(url)

    return res.json({ url });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
