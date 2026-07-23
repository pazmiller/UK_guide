import Link from 'next/link';

export default function ContributionAdminErrorPage()
{
  return (
    <main className="grid min-h-screen place-items-center bg-[#F6F8FC] px-5 text-center text-[#1D3557]">
      <div>
        <h1 className="text-3xl font-black">审核队列暂时无法读取</h1>
        <p className="mt-3 text-[#1D3557]/65">检查 GitHub App 配置后再重试。</p>
        <Link href="/contribute/admin" className="mt-6 inline-flex min-h-11 items-center bg-[#1D3557] px-4 font-black text-white">重新加载</Link>
      </div>
    </main>
  );
}
