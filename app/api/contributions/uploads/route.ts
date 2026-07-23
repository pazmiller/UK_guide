import { NextResponse } from 'next/server';
import { contributionUploadRequestSchema } from '@/lib/contributions/schema';
import { createContributionUpload } from '@/lib/server/r2';

export const runtime = 'nodejs';

export async function POST( request: Request )
{
  let body: unknown;
  try
  {
    body = await request.json();
  } catch
  {
    return NextResponse.json( { error: '图片信息格式不正确。' }, { status: 400 } );
  }

  const parsed = contributionUploadRequestSchema.safeParse( body );
  if ( !parsed.success )
  {
    return NextResponse.json( { error: parsed.error.issues[ 0 ]?.message ?? '图片不符合上传要求。' }, { status: 400 } );
  }

  try
  {
    const upload = await createContributionUpload( parsed.data.contentType, parsed.data.size );
    return NextResponse.json( upload );
  } catch ( error )
  {
    console.error( '[api/contributions/uploads] Failed to create R2 upload.', error );
    return NextResponse.json( { error: '图片上传暂时不可用。' }, { status: 503 } );
  }
}
