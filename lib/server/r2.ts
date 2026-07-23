import 'server-only';

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

const extensionByContentType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

function getR2Config()
{
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_PRIVATE_BUCKET;

  if ( !accountId || !accessKeyId || !secretAccessKey || !bucket )
  {
    throw new Error( 'R2 private storage is not configured.' );
  }

  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function createClient()
{
  const config = getR2Config();
  return {
    bucket: config.bucket,
    client: new S3Client( {
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    } ),
  };
}

export async function createContributionUpload( contentType: keyof typeof extensionByContentType, size: number )
{
  const { client, bucket } = createClient();
  const date = new Date().toISOString().slice( 0, 10 );
  const key = `incoming/${date}/${randomUUID()}.${extensionByContentType[ contentType ]}`;
  const command = new PutObjectCommand( {
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  } );

  return {
    key,
    uploadUrl: await getSignedUrl( client, command, { expiresIn: 10 * 60 } ),
  };
}

export async function createContributionImagePreview( key: string )
{
  if ( !/^incoming\/[a-z0-9/_-]+\.(?:jpe?g|png|webp)$/.test( key ) )
  {
    throw new Error( 'Invalid contribution image key.' );
  }

  const { client, bucket } = createClient();
  return getSignedUrl( client, new GetObjectCommand( { Bucket: bucket, Key: key } ), { expiresIn: 5 * 60 } );
}
