import { redirect } from 'next/navigation';
import { LogOut, ShieldCheck } from 'lucide-react';
import { auth, signIn, signOut } from '@/auth';
import AdminContributionQueue from '@/components/AdminContributionQueue';
import { listContributionIssues } from '@/lib/server/githubApp';

export const dynamic = 'force-dynamic';

export default async function ContributionAdminPage()
{
  const session = await auth();
  if ( !session?.user )
  {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F6F8FC] px-5 py-24 text-[#1D3557]">
        <section className="w-full max-w-md border-y-2 border-[#1D3557] bg-white px-6 py-10 text-center shadow-[0_20px_50px_rgba(29,53,87,0.10)] sm:px-10">
          <ShieldCheck className="mx-auto h-8 w-8 text-[#0F766E]" />
          <h1 className="mt-5 text-3xl font-black">投稿审核台</h1>
          <p className="mt-3 text-sm leading-6 text-[#1D3557]/65">仅允许配置在管理员名单中的 GitHub 账号进入。</p>
          <form action={async () => {
            'use server';
            await signIn( 'github', { redirectTo: '/contribute/admin' } );
          }}>
            <button type="submit" className="mt-7 min-h-12 w-full bg-[#1D3557] px-5 font-black text-white hover:bg-black">使用 GitHub 登录</button>
          </form>
        </section>
      </main>
    );
  }

  let issues;
  try
  {
    issues = await listContributionIssues();
  } catch ( error )
  {
    console.error( '[contribute/admin] Failed to load contribution issues.', error );
    redirect( '/contribute/admin/error' );
  }

  return (
    <main className="min-h-screen bg-[#F6F8FC] pb-20 pt-24 text-[#1D3557]">
      <header className="border-y border-[#1D3557]/14 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#E63946]">Private editorial queue</p>
            <h1 className="mt-2 text-4xl font-black">投稿审核台</h1>
            <p className="mt-2 text-sm font-bold text-[#1D3557]/55">{issues.length} 条记录 · 当前账号 @{session.user.githubLogin}</p>
          </div>
          <form action={async () => {
            'use server';
            await signOut( { redirectTo: '/contribute/admin' } );
          }}>
            <button type="submit" className="inline-flex min-h-10 items-center gap-2 border border-[#1D3557]/18 px-3 text-sm font-bold hover:border-[#1D3557]"><LogOut className="h-4 w-4" />退出</button>
          </form>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <AdminContributionQueue issues={issues} />
      </section>
    </main>
  );
}
