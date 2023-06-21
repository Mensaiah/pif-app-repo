import { PutObjectCommand, S3, CreateBucketCommand } from '@aws-sdk/client-s3';

import appConfig from '../config';

const s3Client = new S3({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  endpoint: appConfig.spacesConfigs.endpoint,
  region: appConfig.spacesConfigs.region,
  credentials: {
    accessKeyId: appConfig.spacesConfigs.key,
    secretAccessKey: appConfig.spacesConfigs.secret,
  },
});

// Creates the new Space.
export const createNewBucketSpace = async (name: { Bucket: string }) => {
  try {
    const data = await s3Client.send(new CreateBucketCommand(name));
    return data.Location;
  } catch (err) {
    throw err;
  }
};

// Uploads the specified file to the chosen path.
export const uploadToSpace = async (uploadParams: {
  Key: string;
  Body: Buffer;
  ContentType: string;
}) => {
  try {
    const uploadData = {
      ...uploadParams,
      Bucket: 'pif-space',
      ACL: 'public-read',
    };

    await s3Client.send(new PutObjectCommand(uploadData));

    return `https://${uploadData.Bucket}.nyc3.cdn.digitaloceanspaces.com/${uploadData.Key}`;
  } catch (err) {
    throw err;
  }
};

export { s3Client };
