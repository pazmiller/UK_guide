import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { tipRoutingSchema } from '@/lib/contributions/schema';
import { acceptContributionIssue, replaceStatusLabel } from '@/lib/server/githubApp';
import { manuallyApproveContribution, reevaluateContribution, ReviewConflict } from '@/lib/server/manualContributionReview';
import { changeRequestSchema } from '@/lib/contributions/change-contract';
import { approveChange, prepareChange } from '@/lib/server/approvedChanges';

const actionSchema = z.discriminatedUnion( 'action', [
  z.object( { action: z.literal( 'accept' ), tipRouting: tipRoutingSchema.optional(), change: changeRequestSchema } ),
  z.object( { action: z.literal( 'prepare-change' ) } ),
  z.object( { action: z.literal( 'close' ) } ),
  z.object( { action: z.literal( 'manual-approve' ), headSha: z.string().regex( /^[a-f0-9]{40}$/ ), reason: z.string().trim().min( 1 ).max( 500 ) } ),
  z.object( { action: z.literal( 'reevaluate' ) } ),
] );

export async function POST( request: Request, context: { params: Promise<{ issueNumber: string }> } )
{
  const session = await auth();
  if ( !session?.user ) return NextResponse.json( { error: '未登录。' }, { status: 401 } );
  const actor = session.user.githubLogin?.toLowerCase();
  const admins = ( process.env.ADMIN_GITHUB_LOGINS ?? '' ).split( ',' ).map( login => login.trim().toLowerCase() );
  if ( !actor || !admins.includes( actor ) ) return NextResponse.json( { error: '没有管理员权限。' }, { status: 403 } );
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
    if ( parsed.data.action === 'prepare-change' ) return NextResponse.json( await prepareChange( issueNumber ) );
    if ( parsed.data.action === 'accept' ) {
      const change = await approveChange( issueNumber, parsed.data.change, actor );
      await acceptContributionIssue( issueNumber, parsed.data.tipRouting, change );
    }
    else if ( parsed.data.action === 'manual-approve' ) await manuallyApproveContribution( issueNumber, parsed.data.headSha, parsed.data.reason, actor );
    else if ( parsed.data.action === 'reevaluate' ) await reevaluateContribution( issueNumber );
    else await replaceStatusLabel( issueNumber, 'status:closed', true );
    return NextResponse.json( { ok: true } );
  } catch ( error )
  {
    if ( error instanceof ReviewConflict ) return NextResponse.json( { error: error.message }, { status: 409 } );
    console.error( `[api/admin/contributions/${issueNumber}] GitHub update failed.`, error );
    return NextResponse.json( { error: 'GitHub 状态更新失败。' }, { status: 503 } );
  }
}
