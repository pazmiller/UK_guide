import type { Metadata } from 'next';
import { ClipboardPenLine, GraduationCap, MapPinned, ShieldAlert, UtensilsCrossed } from 'lucide-react';
import ContributionForm from '@/components/ContributionForm';

export const metadata: Metadata = {
  title: '出一份力！｜提交英国生活信息',
  description: '提交餐厅、景点、避雷信息、大学评价或其他实用线索，供 UK CFFA 审核后收录。',
};

const contributionTypes = [
  { title: '餐厅 / Restaurant', detail: '帮大家推荐你心目中最爱的宝藏餐厅，打破带英美食荒漠的stereotype！', icon: UtensilsCrossed },
  { title: '景点 / Attraction', detail: '帮大家避雷那些名不副实的chanmei景点', icon: MapPinned },
  { title: '避雷 / Avoid', detail: '踩坑、避雷，帮大家别被宰。', icon: ShieldAlert },
  { title: '大学评价 / University', detail: '留下真实体验，帮助后来的学弟学妹，或者帮避雷……', icon: GraduationCap },
];

export default function ContributePage()
{
  return (
    <div className="min-h-screen bg-[#F6F8FC] pt-20 text-[#1D3557]">
      <section className="overflow-hidden bg-[#1D3557] text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-[#F4A261]">
                <ClipboardPenLine className="h-4 w-4" />
                Community contribution desk
              </div>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
                出一份力！
              </h1>

            </div>
            <p className="border-l-2 border-[#E63946] pl-5 text-base leading-7 text-white/72 lg:mb-1">
              直接投稿进入自动和最后一道人工审核，无需私信米勒。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:px-10 lg:py-20">
        <aside className="lg:pt-2">
          <p className="text-sm font-bold uppercase tracking-wide text-[#E63946]">How it works</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[#1D3557]">你的体验，值得被好好珍藏下，与群友共享回忆</h2>
          <ol className="mt-9 space-y-6 border-l border-[#1D3557]/16 pl-5">
            <li>
              <p className="text-xs font-black tracking-wide text-[#E63946]">01 / 投稿</p>
              <p className="mt-1 leading-7 text-[#1D3557]/72">投稿你的体验和发现。</p>
            </li>
            <li>
              <p className="text-xs font-black tracking-wide text-[#E63946]">02 / 审核</p>
              <p className="mt-1 leading-7 text-[#1D3557]/72">我会负责核对。</p>
            </li>
            <li>
              <p className="text-xs font-black tracking-wide text-[#E63946]">03 / 收录</p>
              <p className="mt-1 leading-7 text-[#1D3557]/72">通过后便会收录进网站，你的贡献也会出现在感谢名单！</p>
            </li>
          </ol>

          <div className="mt-10 border-y border-[#1D3557]/12 py-6">
            <p className="text-sm font-bold text-[#1D3557]">我可以投什么？</p>
            <div className="mt-5 space-y-4">
              {contributionTypes.map( ( item ) => (
                <div key={item.title} className="flex gap-3">
                  <item.icon className="mt-1 h-4 w-4 shrink-0 text-[#0F766E]" />
                  <div>
                    <p className="font-bold text-[#1D3557]">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-6 text-[#1D3557]/65">{item.detail}</p>
                  </div>
                </div>
              ) )}
            </div>
          </div>
        </aside>

        <ContributionForm />
      </section>
    </div>
  );
}
