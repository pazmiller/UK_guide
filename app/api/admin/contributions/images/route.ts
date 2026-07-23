import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createContributionImagePreview } from '@/lib/server/r2';

export async function GET( request: Request )
{
  const session = await auth();
  if ( !session?.user ) return NextResponse.json( { error: '未登录。' }, { status: 401 } );

  const key = new URL( request.url ).searchParams.get( 'key' ) ?? '';
  try
  {
    return NextResponse.redirect( await createContributionImagePreview( key ) );
  } catch ( error )
  {
    console.error( '[api/admin/contributions/images] Preview failed.', error );
    return NextResponse.json( { error: '图片无法预览。' }, { status: 404 } );
  }
}
