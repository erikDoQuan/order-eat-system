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
  const bucketName = 'uploads';
  const command = new CreateBucketCommand({ Bucket: bucketName });

  try {
    await s3Client.send(command);
    console.log(`✅ Bucket "${bucketName}" đã được tạo thành công.`);
  } catch (error: any) {
    if (error.Code === 'BucketAlreadyOwnedByYou' || error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`⚠️ Bucket "${bucketName}" đã tồn tại.`);
    } else {
      console.error('❌ Lỗi khi tạo bucket:', error);
    }
  }
}

createBucket(); 