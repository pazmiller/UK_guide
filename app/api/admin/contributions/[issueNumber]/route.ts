import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { replaceStatusLabel } from '@/lib/server/githubApp';

const actionSchema = z.object( { action: z.enum( [ 'accept', 'close' ] ) } );

export async function POST( request: Request, context: { params: Promise<{ issueNumber: string }> } )
{
  const session = await auth();
  if ( !session?.user ) return NextResponse.json( { error: '未登录。' }, { status: 401 } );
  if ( request.headers.get( 'origin' ) !== new URL( request.url ).origin )
  {
    return NextResponse.json( { error: '请求来源不正确。' }, { status: 403 } );
  }

  const { issueNumber: issueNumberValue } = await context.params;
  const issueNumber = Number( issueNumberValue );
  if ( !Number.isInteger( issueNumber ) || issueNumber <= 0 )
  {
    return NextResponse.json( { error: '投稿编号不正确。' }, { status: 400 } );
  }

  const parsed = actionSchema.safeParse( await request.json().catch( () => null ) );
  if ( !parsed.success ) return NextResponse.json( { error: '操作不正确。' }, { status: 400 } );

  try
  {
    if ( parsed.data.action === 'accept' ) await replaceStatusLabel( issueNumber, 'status:accepted' );
    else await replaceStatusLabel( issueNumber, 'status:closed', true );
    return NextResponse.json( { ok: true } );
  } catch ( error )
  {
    console.error( `[api/admin/contributions/${issueNumber}] GitHub update failed.`, error );
    return NextResponse.json( { error: 'GitHub 状态更新失败。' }, { status: 503 } );
  }
}
