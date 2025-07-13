import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: 'http://localhost:9000',
  forcePathStyle: true,
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
  },
});

async function createBucket() {
  const command = new CreateBucketCommand({ Bucket: 'uploads' });
  await s3Client.send(command);
  console.log('✅ Bucket "uploads" đã được tạo');
}

createBucket(); 