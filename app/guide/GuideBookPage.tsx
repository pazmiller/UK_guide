'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import
{
  AlertTriangle,
  BookOpen,
  Bookmark,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  FileText,
  MapPin,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';
import type { GuideContribution } from '@/lib/guideContributions';

type GuideSection = {
  id: string;
  title: string;
  body: ReactNode;
};

const linkTones = {
  apple: 'text-[#1D1D1F]',
  ee: 'text-[#007A33]',
  o2: 'text-[#0050A4]',
  vodafone: 'text-[#C8102E]',
  three: 'text-[#3B1B6F]',
  giffgaff: 'text-[#202020]',
  aldi: 'text-[#0050AA]',
  lidl: 'text-[#0050AA]',
  tesco: 'text-[#00539F]',
  sainsburys: 'text-[#B64B00]',
  asda: 'text-[#4E7E16]',
  morrisons: 'text-[#006B3C]',
  waitrose: 'text-[#006B4F]',
  marks: 'text-[#222222]',
  railcard: 'text-[#B51F2D]',
  nationalRail: 'text-[#243B7A]',
  trainline: 'text-[#008A7A]',
  trainPal: 'text-[#14875A]',
  tfl: 'text-[#113B92]',
  bee: 'text-[#6B4E00]',
  swift: 'text-[#5A2D82]',
  nationalExpress: 'text-[#B71624]',
  westMidlandsMetro: 'text-[#007C91]',
  lothian: 'text-[#007E70]',
  edinburghTrams: 'text-[#006B3F]',
  scotRail: 'text-[#005EB8]',
  hsbc: 'text-[#DB0011]',
  barclays: 'text-[#0065B3]',
  lloyds: 'text-[#006A4D]',
  natwest: 'text-[#4B286D]',
  santander: 'text-[#C8102E]',
  monzo: 'text-[#D64550]',
  starling: 'text-[#5B3CC4]',
  revolut: 'text-[#1D1D1F]',
  royalMail: 'text-[#C8102E]',
  evri: 'text-[#702C7A]',
  dpd: 'text-[#C41230]',
  amazon: 'text-[#A85B00]',
  govUk: 'text-[#1D70B8]',
} as const;

const quickChecklist = [
  '确认正式手机号码',
  '检查 UKVI account',
  '注册 GP',
  '准备备用支付',
  '查清本地交通',
  '开启手机找回',
  '记住 999 / 101 / 111',
  '保存学校紧急联系人',
];

const simScenarios = [
  {
    title: '伦敦、曼城、伯明翰、利兹等大城市',
    body: <>优先比较价格、流量、是否支持 eSIM。常见选择包括 <InlineGuideLink href="https://ee.co.uk/" tone={linkTones.ee}>EE</InlineGuideLink>、<InlineGuideLink href="https://www.o2.co.uk/" tone={linkTones.o2}>O2</InlineGuideLink>、<InlineGuideLink href="https://www.vodafone.co.uk/" tone={linkTones.vodafone}>Vodafone</InlineGuideLink>、<InlineGuideLink href="https://www.three.co.uk/" tone={linkTones.three}>Three</InlineGuideLink>，以及 <InlineGuideLink href="https://www.giffgaff.com/" tone={linkTones.giffgaff}>giffgaff</InlineGuideLink>、VOXI、SMARTY、Lebara 等虚拟运营商。</>,
  },
  {
    title: '苏格兰、威尔士、英格兰北部小城、海边或乡村校区',
    body: '不要只看价格，先用宿舍、教学楼和常去区域的 postcode 查信号覆盖。',
  },
  {
    title: '经常给国内打电话',
    body: '可比较 Lebara、Lyca 等是否包含国际通话分钟数，并确认中国大陆号码是否在套餐范围内。',
  },
  {
    title: '流量需求很高',
    body: '比较 unlimited data、fair usage policy、热点共享、限速规则和月费变化。',
  },
  {
    title: '短期刚落地',
    body: '可以先用月付 SIM-only 或 pay as you go，稳定后再绑定银行、学校邮箱和 2FA。',
  },
];

const supermarketGroups = [
  <>便宜型：<SupermarketMapLink query="Aldi" tone={linkTones.aldi}>Aldi</SupermarketMapLink>、<SupermarketMapLink query="Lidl" tone={linkTones.lidl}>Lidl</SupermarketMapLink>。</>,
  <>常见综合型：<SupermarketMapLink query="Tesco" tone={linkTones.tesco}>Tesco</SupermarketMapLink>、<SupermarketMapLink query="Sainsbury's" tone={linkTones.sainsburys}>Sainsbury’s</SupermarketMapLink>、<SupermarketMapLink query="Asda" tone={linkTones.asda}>Asda</SupermarketMapLink>、<SupermarketMapLink query="Morrisons" tone={linkTones.morrisons}>Morrisons</SupermarketMapLink>。</>,
  <>偏贵 / 品质型：<SupermarketMapLink query="Waitrose" tone={linkTones.waitrose}>Waitrose</SupermarketMapLink>、<SupermarketMapLink query="M&S Food" tone={linkTones.marks}>M&amp;S Food</SupermarketMapLink>。</>,
  '日用品 / 药妆：Boots、Superdrug、Savers。',
  '亚洲 / 中国超市：中超、韩国超市、亚洲食品店，适合买米、调料、火锅底料、速冻食品。',
];

const transportCities = [
  {
    city: 'London / 伦敦',
    items: [
      <>地铁、公交、Elizabeth line、Overground、DLR 等主要使用 contactless 银行卡、Apple Pay / Google Pay 或 <InlineGuideLink href="https://tfl.gov.uk/fares/contactless-and-oyster-account" tone={linkTones.tfl}>TfL / Oyster</InlineGuideLink>。</>,
      'Tube / rail 通常进出站都要 tap，公交一般只 tap in。',
      '不要多人共用同一张 contactless 卡进站。',
      <>学生可了解 <InlineGuideLink href="https://tfl.gov.uk/fares/free-and-discounted-travel/18-plus-student-oyster-photocard" tone={linkTones.tfl}>18+ Student Oyster</InlineGuideLink>、Railcard 绑定 Oyster 等优惠。</>,
    ],
  },
  {
    city: 'Manchester / 曼彻斯特',
    items: [
      <>使用 <InlineGuideLink href="https://bee.network/" tone={linkTones.bee}>Bee Network</InlineGuideLink>，公交和 tram 可用 contactless tap and go。</>,
      '搭 tram 注意 tap in / tap out。',
      '多次出行前查看 daily / weekly cap 是否更划算。',
    ],
  },
  {
    city: 'Birmingham / West Midlands',
    items: [
      '常见方式包括 bus、tram、train。',
      <>可查 <InlineGuideLink href="https://www.swiftcard.org.uk/" tone={linkTones.swift}>Swift card</InlineGuideLink>、<InlineGuideLink href="https://www.nationalexpress.com/en/west-midlands" tone={linkTones.nationalExpress}>National Express West Midlands</InlineGuideLink>、<InlineGuideLink href="https://westmidlandsmetro.com/" tone={linkTones.westMidlandsMetro}>West Midlands Metro</InlineGuideLink>。</>,
      '城市间通勤要注意 train ticket 类型、peak / off-peak 时间。',
    ],
  },
  {
    city: 'Edinburgh / 爱丁堡',
    items: [
      <>常见方式包括 <InlineGuideLink href="https://www.lothianbuses.com/" tone={linkTones.lothian}>Lothian Buses</InlineGuideLink>、<InlineGuideLink href="https://edinburghtrams.com/" tone={linkTones.edinburghTrams}>Edinburgh Trams</InlineGuideLink>。</>,
      '可使用官方 Bus & Tram app 或 contactless。',
      'Tram 前往机场时票价规则可能不同，出行前确认。',
    ],
  },
  {
    city: 'Glasgow / 格拉斯哥',
    items: [
      <>常见方式包括 Subway、bus、<InlineGuideLink href="https://www.scotrail.co.uk/" tone={linkTones.scotRail}>ScotRail</InlineGuideLink>。</>,
      'Subway / rail / bus 的票务系统不完全一样，频繁通勤可研究 Smartcard 或 season ticket。',
      <>在苏格兰城市之间通勤时优先查 <InlineGuideLink href="https://www.scotrail.co.uk/" tone={linkTones.scotRail}>ScotRail</InlineGuideLink>。</>,
    ],
  },
  {
    city: 'Oxford / Cambridge',
    items: [
      '城市较适合步行、骑车和公交。',
      '骑车要买锁、灯、头盔，注意靠左行驶和环岛规则。',
      '不要把自行车随意停在禁止停车区域。',
    ],
  },
];

const otherReminders = [
  '插头：英国是 Type G 三孔插头，提前准备转换头。',
  '天气：冬天阴冷潮湿，注意防水外套、保暖、除湿。',
  '保险：考虑手机险、财产险、旅行险。',
  <>快递：<InlineGuideLink href="https://www.royalmail.com/" tone={linkTones.royalMail}>Royal Mail</InlineGuideLink>、<InlineGuideLink href="https://www.evri.com/" tone={linkTones.evri}>Evri</InlineGuideLink>、<InlineGuideLink href="https://www.dpd.co.uk/" tone={linkTones.dpd}>DPD</InlineGuideLink>、<InlineGuideLink href="https://www.amazon.co.uk/ulp" tone={linkTones.amazon}>Amazon Locker</InlineGuideLink> 等取件方式不同。</>,
  '垃圾分类：不同 council 规则不同，按住址查询 bin collection day。',
  '紧急联系人：保存学校 security、宿舍 reception、朋友、GP、保险电话。',
  <>兼职：确认 <InlineGuideLink href="https://www.gov.uk/student-visa" tone={linkTones.govUk}>Student visa 工作时长限制</InlineGuideLink>，不要做 cash-in-hand 或可疑工作。</>,
  '交通安全：英国靠左行驶，过马路先看右再看左。',
  '酒吧 pubbing：酒吧是英国本地人不得不尝的周常甚至是日常，每周五大家一起去聚一聚来一 pint，玩玩 pub game 或者干聊天也是蛮不错的。',
  '小心别人递的奇怪的烟，不确定就不要接，要确保不是“飞叶子”或其他你不了解的东西。',
  '心理健康：保存学校 wellbeing service / counselling service。',
  '中国大使馆 / 领馆：保存护照遗失、紧急旅行证件相关联系信息。',
  <>Apple Care + 建议在英国大城市的群友买一项附加的<InlineGuideLink href="https://support.apple.com/en-gb/iphone/theft-loss-claims" tone={linkTones.apple}>Theft &amp; Loss</InlineGuideLink>，这样手机被偷了抢了可以直接换新机。（如果在伦敦感觉这个是刚需）</>
];

const officialFooterLinks = [
  { href: 'https://www.police.uk/pu/contact-the-police/report-a-crime-incident/', label: 'Police 999 / 101' },
  { href: 'https://www.gov.uk/evisa', label: 'GOV.UK eVisa' },
  { href: 'https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/', label: 'NHS 111' },
];

function BulletList( { items }: { items: ReactNode[] } )
{
  return (
    <ul className="space-y-2.5 text-[15px] leading-7 text-[#2C261E]">
      {items.map( ( item, index ) => (
        <li key={typeof item === 'string' ? item : index} className="flex gap-2.5">
          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#0F766E]" />
          <span>{item}</span>
        </li>
      ) )}
    </ul>
  );
}

function NumberedList( { items }: { items: string[] } )
{
  return (
    <ol className="space-y-3 text-[15px] leading-7 text-[#2C261E]">
      {items.map( ( item, index ) => (
        <li key={item} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D66F78] text-xs font-black text-[#FFF8E8]">
            {index + 1}
          </span>
          <span>{item}</span>
        </li>
      ) )}
    </ol>
  );
}

function Notice( { children }: { children: ReactNode } )
{
  return (
    <div className="border-l-4 border-[#B45309] bg-[#FFF7DE] px-4 py-3 text-[15px] leading-7 text-[#5B3511]">
      <div className="flex gap-3">
        <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-[#B45309]" />
        <div>{children}</div>
      </div>
    </div>
  );
}

function ExternalGuideLink( { href, label }: { href: string; label: string } )
{
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center gap-1.5 border-b border-[#D66F78]/30 text-sm font-bold text-[#D66F78] transition-colors hover:border-[#0F766E] hover:text-[#0F766E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F766E]"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </Link>
  );
}

function InlineGuideLink( { href, children, tone }: { href: string; children: ReactNode; tone: string } )
{
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`mx-0.5 inline-flex items-center gap-1 font-bold underline decoration-current decoration-2 underline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3557] ${tone}`}
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

function SupermarketMapLink( { query, children, tone }: { query: string; children: ReactNode; tone: string } )
{
  return (
    <InlineGuideLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent( query )}`} tone={tone}>
      {children}
    </InlineGuideLink>
  );
}

function TextRows( { rows }: { rows: Array<{ title: string; body: ReactNode }> } )
{
  return (
    <div className="divide-y divide-[#2C261E]/12 border-y border-[#2C261E]/12">
      {rows.map( ( row ) => (
        <div key={row.title} className="grid gap-2 py-4 md:grid-cols-[0.42fr_1fr]">
          <h4 className="text-lg font-black text-[#1D3557]">{row.title}</h4>
          <p className="text-[15px] leading-7 text-[#2C261E]/82">{row.body}</p>
        </div>
      ) )}
    </div>
  );
}

const guideSections: GuideSection[] = [
  {
    id: 'sim',
    title: '1. 手机卡：不要长期依赖临时 SIM',
    body: (
      <div className="space-y-5">
        <BulletList
          items={[
            '很多同学在签证中心或抵达前后会拿到赠送 SIM 卡，这类卡可以临时过渡，但不建议长期绑定银行、学校账户、邮箱二次验证。',
            '如果收到异常多的诈骗电话、陌生短信、可疑链接，应尽快考虑更换正式 SIM。',
            '不要点击短信里的“银行验证”“快递补款”“HMRC 退税”“签证问题”“NHS 付款”等可疑链接。',
            '办卡前先用学校宿舍、租房 postcode 查询信号覆盖，再选择运营商。',
          ]}
        />
        <TextRows rows={simScenarios} />
        <Notice>
          <strong>重要：</strong>不要把刚拿到的临时号码马上绑定所有重要账户。确认号码稳定、安全、不会马上停用后，再绑定银行、学校邮箱和二次验证。
        </Notice>
      </div>
    ),
  },
  {
    id: 'groceries',
    title: '2. 线下超市：拼好饭Iceland，高贵的等玫瑰 & 网购：即日达Amazon和京东入欧Joybuy',
    body: (
      <div className="space-y-5">
        <BulletList items={supermarketGroups} />
        <div className="border-l-4 border-[#0F766E] pl-4">
          <h4 className="mb-3 text-xl font-black text-[#1D3557]">网上超市</h4>
          <BulletList
            items={[
              'Amazon 和最近京东在英国做起来的 Joybuy，普遍会被当作送货最快的网购平台之一，适合买日用品、零食和临时缺的东西。',
              'Ocado 以及 Tesco、Sainsbury’s、Asda、Morrisons 等大超市也都有网上大批量购物，适合一次性补米面粮油、饮料、清洁用品。',
              '传统中超也有很多购物网站，比如优西等，适合买中餐调料、火锅底料、速冻和亚洲食品。',
              '不过现在不少同学会感觉这类传统中超网站正在被 Joybuy 这类更快的平台挤压。下单前还是按 postcode、配送费、最低起送、缺货替换和退货规则确认。',
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-4">
            <ExternalGuideLink href="https://www.ocado.com/" label="Ocado" />
            <ExternalGuideLink href="https://www.joybuy.co.uk/" label="Joybuy UK" />
          </div>
        </div>
        <div className="border-l-4 border-[#0F766E] pl-4">
          <h4 className="mb-3 text-xl font-black text-[#1D3557]">省钱技巧</h4>
          <BulletList
            items={[
              '办 Tesco Clubcard、Sainsbury’s Nectar、Boots Advantage Card 等会员。',
              '晚上留意 yellow sticker reduced items。',
              '可以用 Too Good To Go 类 app 买临期食物。',
              '初到英国不要一次性买太多锅具和电器，先确认宿舍是否允许使用。',
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-4">
            <ExternalGuideLink href="https://www.tesco.com/clubcard/" label="Tesco Clubcard" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'transport',
    title: '3. 公共交通：火车、地铁、Bus（最不靠谱但很多小城市只能以靠它）、Railcard',
    body: (
      <div className="space-y-6">
        <Notice>
          如果你经常坐火车，建议尽早办一张 <InlineGuideLink href="https://www.16-25railcard.co.uk/" tone={linkTones.railcard}>16-25 Railcard</InlineGuideLink> 或 <InlineGuideLink href="https://www.26-30railcard.co.uk/" tone={linkTones.railcard}>26-30 Railcard</InlineGuideLink>，学生通常能享受火车票折扣。坐车时要确保 Railcard 能正常出示，工作人员会查票，也可能一起查 Railcard。
          （可以绑定在 <InlineGuideLink href="https://www.thetrainline.com/" tone={linkTones.trainline}>Trainline</InlineGuideLink> 相关的 app 里，在 app 里也可以办理）
        </Notice>
        <div className="divide-y divide-[#2C261E]/12 border-y border-[#2C261E]/12">
          {transportCities.map( ( city ) => (
            <div key={city.city} className="py-5">
              <h4 className="mb-3 flex items-center gap-2 text-xl font-black text-[#1D3557]">
                <MapPin className="h-4 w-4 text-[#D66F78]" />
                {city.city}
              </h4>
              <BulletList items={city.items} />
            </div>
          ) )}
        </div>
        <div className="border-l-4 border-[#D66F78] pl-4">
          <h4 className="mb-3 text-xl font-black text-[#1D3557]">火车机票和整体方面</h4>
          <BulletList
            items={[
              <>Trip、<InlineGuideLink href="https://www.nationalrail.co.uk/" tone={linkTones.nationalRail}>National Rail</InlineGuideLink>、<InlineGuideLink href="https://www.thetrainline.com/" tone={linkTones.trainline}>Trainline</InlineGuideLink>、<InlineGuideLink href="https://www.mytrainpal.com/" tone={linkTones.trainPal}>TrainPal</InlineGuideLink>，或各铁路公司官网，均可购买火车票。</>,
              '注意 Advance、Off-Peak、Anytime、Return、Open Return 的区别。',
              '晚上回家尽量提前查末班车，不要默认公交或地铁 24 小时运行。',
              '地铁偶尔会延迟维修罢工，但比伦敦地铁更不可靠的是全英国的散漫巴士司机'
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-4">
            <ExternalGuideLink href="https://uk.trip.com/" label="Trip.com" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'safety',
    title: '4. 手机安全：英国大城市一定要注意',
    body: (
      <div className="space-y-6">
        <BulletList
          items={[
            '不要在马路边、地铁口、公交站、酒吧门口长时间举着手机。',
            '走路导航时尽量靠内侧，手机拿在远离马路的一侧。',
            '骑车或电动车经过时抢手机很常见，尤其在伦敦、曼城等大城市中心区域。',
            '不要边走路边戴降噪耳机完全隔绝环境声音。',
            '夜间尽量走主路、亮处、人多的地方。',
            '不要把手机、护照、银行卡全部放在同一个包里。',
            '开启 Find My iPhone / Find My Device，记录 IMEI 号码。',
            '设置 SIM PIN、强密码、Face ID / Touch ID，银行 app、邮箱、学校账号都要开双重验证。',
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: '999', body: '正在发生、有人受伤、感觉危险' },
            { title: '101', body: '非紧急报警或补充报案信息' },
            { title: '111', body: '非紧急医疗建议，按地区规则使用' },
          ].map( ( item ) => (
            <div key={item.title} className="border-y border-[#1D3557]/18 py-3">
              <div className="text-3xl font-black text-[#D66F78]">{item.title}</div>
              <p className="text-sm leading-6 text-[#2C261E]/78">{item.body}</p>
            </div>
          ) )}
        </div>
        <div className="border-l-4 border-[#D66F78] pl-4">
          <h4 className="mb-3 flex items-center gap-2 text-xl font-black text-[#1D3557]">
            <PhoneCall className="h-4 w-4" />
            手机被抢后流程
          </h4>
          <NumberedList
            items={[
              '先保证人身安全，不要追抢匪。',
              '如果正在发生、有人受伤或感觉危险，打 999。',
              '非紧急情况可打 101 或在线报警。',
              '远程锁定或擦除手机。',
              '联系运营商停 SIM。',
              '联系银行冻结卡和 app。',
              '保留 crime reference number，用于保险理赔。',
              '修改邮箱、银行、学校账号密码。',
            ]}
          />
        </div>
      </div>
    ),
  },
  {
    id: 'evisa',
    title: '5. 签证与身份状态：确认 eVisa',
    body: (
      <div className="space-y-5">
        <BulletList
          items={[
            '英国已逐步使用 eVisa 作为数字身份状态，具体状态以 GOV.UK 和 UKVI account 为准。',
            '到英国前后检查 UKVI account 是否能正常登录。',
            '确认护照信息和 eVisa 绑定正确，换护照、改姓名或发现签证信息有误时及时更新。',
            '保存 share code 使用方式说明；重要场景应登录官方系统生成最新状态，不要只依赖截图。',
            '保存学校 visa compliance / international student support 联系方式。',
          ]}
        />
        <div className="flex flex-wrap gap-4">
          <ExternalGuideLink href="https://www.gov.uk/evisa" label="GOV.UK eVisa" />
          <ExternalGuideLink href="https://www.gov.uk/view-prove-immigration-status" label="View and prove status" />
        </div>
      </div>
    ),
  },
  {
    id: 'nhs',
    title: '6. 医疗：尽快注册 GP',
    body: (
      <div className="space-y-5">
        <div className="grid gap-3 rounded-[22px] border border-white/45 bg-white/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur-md md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <div className="rounded-2xl border border-[#D66F78]/24 bg-[#FFF8E8]/62 p-4 shadow-[0_12px_28px_rgba(29,53,87,0.07)]">
            <p className="text-xs font-black uppercase tracking-wide text-[#D66F78]">NHS GP</p>
            <h4 className="mt-1 text-lg font-black text-[#1D3557]">General Practitioner</h4>
            <p className="mt-2 text-[15px] leading-7 text-[#2C261E]/82">
              NHS 的 GP 是 primary care doctor，也就是全科医生，接近国内的普通内科，是英国医疗系统的第一入口。
            </p>
          </div>
          <div className="hidden items-center justify-center px-1 text-2xl font-black text-[#D66F78] md:flex">→</div>
          <div className="flex items-center justify-center text-2xl font-black text-[#D66F78] md:hidden">↓</div>
          <div className="rounded-2xl border border-[#0F766E]/24 bg-[#F6FFF9]/54 p-4 shadow-[0_12px_28px_rgba(29,53,87,0.07)]">
            <p className="text-xs font-black uppercase tracking-wide text-[#0F766E]">Referral route</p>
            <h4 className="mt-1 text-lg font-black text-[#1D3557]">GP → Specialist</h4>
            <p className="mt-2 text-[15px] leading-7 text-[#2C261E]/82">
              通常只有 GP 给你发 referral 后，才能看内分泌科、心脏科等 specialist；GP 这里主要做基础问诊、普通检查和转诊判断。
            </p>
          </div>
        </div>
        <BulletList
          items={[
            '到英国后尽快用住址注册 GP，不同地区和诊所流程可能不同',
            '对已支付 IHS 或符合资格的留学生，大多数 NHS 服务不是像私立医疗那样按次收费；英格兰处方药通常按每个 item 收固定费用，£9.90',
            '看专科医生或做转诊通常要等很久，几周到几个月都可能，1 到 3 个月并不稀奇。所以尽快注册 GP，有病尽早联系 GP 或 NHS 111 很重要',
            '紧急生命危险打 999；非紧急医疗建议可用 NHS 111。',
            '不同于国内，“立刻就诊”基本只存在于 A&E 急诊；一般不是非常严重或急性的大病，到 A&E 也可能等上好几个小时，体验会很恐怖',
            '牙医通常需要单独注册，NHS dentist 名额可能紧张。',
            '常用非处方药可以在 Boots、Superdrug、药房或超市购买。',
            '带药入境前确认是否需要英文处方或医生证明。',
            '眼镜、牙科、处方药可能产生额外费用，提前了解。',
            '医疗相关问题可以多问问群友，尤其是本地 GP、药房、牙医和 A&E 体验',
          ]}
        />
        <div className="flex flex-wrap gap-4">
          <ExternalGuideLink href="https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/" label="NHS GP registration" />
          <ExternalGuideLink href="https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/" label="NHS 111" />
        </div>
      </div>
    ),
  },
  {
    id: 'banking',
    title: '7. 银行卡与支付：自由流动',
    body: (
      <div className="space-y-5">
        <BulletList
          items={[
            '初到英国可以先准备一张可用的国际银行卡，再开英国本地账户。',
            <>常见银行包括 <InlineGuideLink href="https://www.hsbc.co.uk/" tone={linkTones.hsbc}>HSBC</InlineGuideLink>、<InlineGuideLink href="https://www.barclays.co.uk/" tone={linkTones.barclays}>Barclays</InlineGuideLink>、<InlineGuideLink href="https://www.lloydsbank.com/" tone={linkTones.lloyds}>Lloyds</InlineGuideLink>、<InlineGuideLink href="https://www.natwest.com/" tone={linkTones.natwest}>NatWest</InlineGuideLink>、<InlineGuideLink href="https://www.santander.co.uk/" tone={linkTones.santander}>Santander</InlineGuideLink>、<InlineGuideLink href="https://monzo.com/" tone={linkTones.monzo}>Monzo</InlineGuideLink>、<InlineGuideLink href="https://www.starlingbank.com/" tone={linkTones.starling}>Starling</InlineGuideLink>、<InlineGuideLink href="https://www.revolut.com/en-GB/" tone={linkTones.revolut}>Revolut</InlineGuideLink> 等。</>,
            '开户可能需要地址证明、学生证明、护照、签证或 eVisa 状态。',
            '不要把验证码告诉任何人。',
            '银行、警察、HMRC、学校都不会要求你把钱转到“安全账户”。',
            '谨慎处理二手交易、租房押金、兼职押金、代缴学费、低价机票等骗局。',
            '大额转账前先电话或当面确认收款方。',
          ]}
        />
        <Notice>
          遇到“账户涉案”“安全账户”“限时转账”“低价内部票”“代缴学费折扣”等说法，先停下来核实。真正紧急的事也经得起你向学校、银行或警方官方渠道确认。
        </Notice>
      </div>
    ),
  },
  {
    id: 'housing',
    title: '8. 租房：入住记得拍照',
    body: (
      <BulletList
        items={[
          '没看房、没合同、没确认 landlord / agent 身份前不要转大额押金。',
          '确认 deposit 是否进入 tenancy deposit protection scheme（第三方押金保护平台，确保房东不会无缘无故扣押金）。',
          '查看 bills 是否 included：水、电、气、网、council tax。',
          '学生通常可能有 council tax exemption，但需要按当地 council 要求提交证明。',
          '入住当天拍照记录房间状态，尤其是墙面、地毯、家具、电器。',
          '确认 smoke alarm、carbon monoxide alarm、门锁是否正常。',
          '不要随便把宿舍门禁卡借给陌生人。',
          '学校的学生公寓上述问题基本可以免除，只剩下 ensuite 的祈祷能碰上干净一点、负责一点的室友。',
        ]}
      />
    ),
  },
  {
    id: 'scams',
    title: '9. 小心诈骗：They are everywhere',
    body: (
      <div className="space-y-5">
        <BulletList
          items={[
            '接到自称银行、警察、DPD、Amazon、RoyalMail、HMRC、NHS、快递、大使馆等等……的电话，不要在电话里直接转账、报验证码或交出账户信息。',
            '任何要求你把钱转到“安全账户”、任何涉及到钱的说法，除了是群主叫你捐钱外，都先停下来核实。',
            '短信里的各种链接，不确定就不要点，自己打开官网或 app 核对是否一致',
            '不要以为骗局只会碰到蠢人，每年留学生被scam到的数不胜数',
            '觉得不对劲时，先问群内、银行官方客服，或者学校。已经被骗时尽快联系银行冻结交易，并按情况报拨打999报警',
          ]}
        />
        <Notice>
          有朋友的警察诈骗案拟真到电话号码模拟，知道你的身份证等家人信息，还会假装像是从真的警察局打给你一样
        </Notice>
        <div className="border-l-4 border-[#D66F78] pl-4">
          <h4 className="mb-3 text-xl font-black text-[#1D3557]">案例阅读</h4>
          <div className="flex flex-wrap gap-4">
            <ExternalGuideLink href="https://zhuanlan.zhihu.com/p/1986517925008527666" label="知乎案例" />
            <ExternalGuideLink href="https://www.51offer.com/article/detail_108905.html" label="留学生被骗案例" />
            <ExternalGuideLink href="https://jurify.co.uk/blog/uk-chinese-students-money-laundering-case" label="洗钱风险案例" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'academic',
    title: '10. 学术规则：不要踩 plagiarism等红线',
    body: (
      <div className="space-y-5">
        <BulletList
          items={[
            '认真阅读学校 academic integrity policy。',
            '不同课程对 ChatGPT / AI tools 的使用规则不同。',
            '引用、改写、代码协作、代写都要严格遵守学校规定。',
            '英国学校可能会因为 academic misconduct 劝退学生，本科阶段通常还会更严。',
            '小组作业要保留自己的贡献记录。',
            '不确定时问 tutor，不要听社交平台或群聊里的模糊说法。',
          ]}
        />
        <ExternalGuideLink href="https://www.gov.uk/student-visa" label="GOV.UK Student visa" />
      </div>
    ),
  },
  {
    id: 'extras',
    title: '11. 其他容易被忽略的事项',
    body: <BulletList items={otherReminders} />,
  },
];

function CommunityGuideBody( { guide }: { guide: GuideContribution } )
{
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide">
        <span className="bg-[#D9B46F] px-2 py-1 text-[#1D3557]">群'大头'补充</span>
        <span className="text-[#1D3557]/55">{guide.city} · {guide.region === 'uk' ? 'UK' : 'EUROPA'}</span>
      </div>
      <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#2C261E]/84">{guide.body}</p>
      {guide.images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {guide.images.map( ( image, index ) => (
            <figure key={image} className="overflow-hidden rounded-2xl border border-white/50 bg-white/35 p-2 shadow-[0_10px_24px_rgba(44,38,30,0.10)]">
              <Image src={image} alt={`${guide.title} 投稿图片 ${index + 1}`} width={900} height={675} className="aspect-[4/3] w-full rounded-xl object-cover" />
            </figure>
          ) )}
        </div>
      )}
      {guide.sourceUrl && <ExternalGuideLink href={guide.sourceUrl} label="查看投稿参考链接" />}
    </div>
  );
}

function BookIllustration( { activeTitle }: { activeTitle: string } )
{
  const [ isBookOpen, setIsBookOpen ] = useState( false );

  return (
    <div className="lg:sticky lg:top-28">
      <style>{`
        .guide-book-shell {
          perspective: 1100px;
        }

        .guide-book-cover {
          transform: perspective(1100px) rotateZ(-6deg) rotateY(0deg);
          transform-origin: 12% 50%;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          transition: transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .guide-cat-paw {
          opacity: 0;
          transform: translate(18px, 24px) rotate(-10deg) scale(0.9);
          transition:
            opacity 260ms ease,
            transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: 0ms;
        }

        .guide-cat-fur {
          background: #fffdf8;
        }

        .guide-cat-bean {
          background: #f1a0aa;
        }

        .guide-cat-main-pad {
          background: #e98491;
        }

        @media (hover: hover) and (pointer: fine) {
          .guide-book-shell:hover .guide-book-cover {
            transform: perspective(1100px) rotateZ(-6deg) rotateY(-58deg) translateX(-3%);
          }

          .guide-book-shell:hover .guide-cat-paw {
            opacity: 1;
            transform: translate(0, 0) rotate(-10deg) scale(1);
            transition-delay: 140ms;
          }
        }

        .guide-book-shell[data-book-open="true"] .guide-book-cover {
          transform: perspective(1100px) rotateZ(-6deg) rotateY(-64deg) translateX(-4%);
        }

        .guide-book-shell[data-book-open="true"] .guide-cat-paw {
          opacity: 1;
          transform: translate(0, 0) rotate(-10deg) scale(1);
          transition-delay: 140ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .guide-book-cover,
          .guide-cat-paw {
            transition: none;
          }
        }
      `}</style>

      <div className="guide-book-shell relative mx-auto aspect-[0.78] max-w-[390px]" data-book-open={isBookOpen}>
        <div className="absolute inset-x-12 bottom-0 h-8 rounded-[50%] bg-[#160F0B]/25 blur-xl" />
        <div className="absolute left-[17%] top-[9%] h-[74%] w-[69%] rotate-3 rounded-lg bg-[#EFE0C1] shadow-[0_28px_70px_rgba(18,22,30,0.34)] ring-1 ring-[#6B4A2C]/20" />
        <div
          className="absolute left-[22%] top-[5%] h-[74%] w-[67%] rotate-6 rounded-lg border border-[#8A6A45]/20 bg-[#FFF8E8] shadow-[0_10px_28px_rgba(26,18,12,0.14)]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(44,38,30,0.08) 0 1px, transparent 1px 27px)',
          }}
        />
        <div
          className="absolute left-[13%] top-[15%] z-10 h-[74%] w-[67%] -rotate-2 overflow-hidden rounded-lg border border-[#AA8A5E]/25 bg-[#FFF8E8] shadow-[0_16px_34px_rgba(44,38,30,0.18)]"
          aria-hidden="true"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(44,38,30,0.09) 0 1px, transparent 1px 26px)',
          }}
        >
          <div className="absolute left-8 top-8 h-px w-36 bg-[#D66F78]/30" />
          <div className="absolute left-8 top-16 h-px w-48 bg-[#2C261E]/13" />
          <div className="absolute left-8 top-24 h-px w-40 bg-[#2C261E]/13" />
          <div className="guide-cat-paw absolute bottom-[12%] right-[8%] h-36 w-36">
            <div className="guide-cat-fur absolute inset-x-2 bottom-0 h-32 rounded-[49%_51%_43%_43%/42%_42%_57%_57%]" />
            <div className="guide-cat-bean absolute left-[10%] top-[36%] h-12 w-[1.55rem] -rotate-[18deg] rounded-[50%_50%_46%_46%/64%_64%_36%_36%]" />
            <div className="guide-cat-bean absolute left-[27%] top-[9%] h-[3.7rem] w-[1.55rem] -rotate-[5deg] rounded-[50%_50%_46%_46%/66%_66%_34%_34%]" />
            <div className="guide-cat-bean absolute right-[27%] top-[9%] h-[3.7rem] w-[1.55rem] rotate-[5deg] rounded-[50%_50%_46%_46%/66%_66%_34%_34%]" />
            <div className="guide-cat-bean absolute right-[8%] top-[27%] h-12 w-[1.55rem] rotate-[18deg] rounded-[50%_50%_46%_46%/64%_64%_36%_36%]" />
            <div className="guide-cat-main-pad absolute bottom-[12%] left-1/2 h-[3.05rem] w-[6.1rem] -translate-x-1/2 rounded-[44%_56%_43%_45%/42%_42%_58%_58%]" />
          </div>
        </div>
        <button
          type="button"
          aria-label={isBookOpen ? '合上赴英指北册子' : '翻开赴英指北册子'}
          aria-pressed={isBookOpen}
          onClick={() => setIsBookOpen( ( open ) => !open )}
          className="guide-book-cover absolute left-[7%] top-[14%] z-20 h-[76%] w-[70%] cursor-pointer overflow-hidden rounded-l-md rounded-r-xl bg-[#1D3557] text-left shadow-[0_28px_62px_rgba(10,18,32,0.44)] ring-1 ring-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9B46F]"
        >
          <div className="absolute inset-y-0 left-0 w-[18%] bg-[#D66F78]" aria-hidden="true" />
          <div className="absolute inset-y-0 left-[18%] w-px bg-white/18" aria-hidden="true" />
          <div className="absolute right-5 top-5 h-16 w-9 rounded-b-full bg-[#D9B46F] shadow-md" aria-hidden="true" />
          <div className="absolute inset-0 px-8 py-10 text-[#FFF8E8]" aria-hidden="true">
            <BookOpen className="mb-6 h-9 w-9 text-[#D9B46F]" />
            <p className="mb-3 text-sm uppercase">UK Arrival</p>
            <div className="h-px w-24 bg-[#D9B46F]" />
            <h2 className="mt-5 text-4xl font-black leading-tight">带英十一律</h2>
            <p className="mt-4 max-w-[11rem] text-sm leading-6 text-[#FFF8E8]/78">
              手机卡、交通、安全、医疗和租房的第一周清单。
            </p>
          </div>
        </button>
        <div className="absolute bottom-[2%] right-[3%] w-[68%] rotate-2 rounded-md border border-[#AA8A5E]/30 bg-[#FFF8E8] p-5 shadow-[0_18px_42px_rgba(44,38,30,0.22)]">
          <div className="mb-3 flex items-center justify-between border-b border-[#2C261E]/18 pb-2">
            <FileText className="h-5 w-5 text-[#D66F78]" />
            <span className="text-xs font-bold uppercase text-[#1D3557]">Current chapter</span>
          </div>
          <p className="text-lg font-black leading-snug text-[#2C261E]">{activeTitle}</p>
          <div className="mt-5 space-y-2">
            <div className="h-px w-full bg-[#2C261E]/12" />
            <div className="h-px w-10/12 bg-[#2C261E]/12" />
            <div className="h-px w-8/12 bg-[#2C261E]/12" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[390px] border border-[#2C261E]/12 bg-[#FFF8E8] p-5 shadow-[0_16px_36px_rgba(44,38,30,0.13)]">
        <div className="mb-4 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-[#D66F78]" />
          <h2 className="text-2xl font-black text-[#1D3557]">第一周先确认一下~</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {quickChecklist.map( ( item ) => (
            <div key={item} className="flex min-h-11 items-center gap-2 border-b border-[#2C261E]/10 py-2 text-sm font-semibold text-[#2C261E]/82 last:border-b-0">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F766E]" />
              <span>{item}</span>
            </div>
          ) )}
        </div>
      </div>
    </div>
  );
}

export default function GuideBookPage( { contributions }: { contributions: GuideContribution[] } )
{
  const [ openSectionId, setOpenSectionId ] = useState( '' );
  const contributionSections: GuideSection[] = contributions.map( ( guide, index ) => ( {
    id: guide.id,
    title: `${guideSections.length + index + 1}. ${guide.title}`,
    body: <CommunityGuideBody guide={guide} />,
  } ) );
  const allGuideSections = [ ...guideSections, ...contributionSections ];
  const activeSection = allGuideSections.find( ( section ) => section.id === openSectionId );

  return (
    <div
      className="min-h-screen overflow-hidden bg-[#F2E8D0] pt-[68px] text-[#2C261E]"
      style={{
        fontFamily: '"PingFang SC", var(--font-noto-sans-sc), "Microsoft YaHei", "Heiti SC", sans-serif',
        backgroundImage: 'linear-gradient(90deg, rgba(29,53,87,0.08) 1px, transparent 1px), linear-gradient(0deg, rgba(214,111,120,0.05) 1px, transparent 1px)',
        backgroundSize: '34px 34px',
      }}
    >
      <svg className="fixed h-0 w-0 overflow-hidden" aria-hidden="true" focusable="false">
        <filter id="guide-section-glass-filter" colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.022" numOctaves="2" seed="23" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.14" result="softened" />
        </filter>
      </svg>

      <style>{`
        @keyframes guideLiquidGlint {
          0%, 100% { opacity: 0.42; transform: translate3d(-7%, -5%, 0) scale(1.03); }
          50%      { opacity: 0.72; transform: translate3d(6%, 4%, 0) scale(1.06); }
        }

        .guide-liquid-section {
          --guide-glass-bg: rgba(255, 248, 232, 0.34);
          --guide-glass-edge: rgba(255, 255, 255, 0.56);
          --guide-glass-shadow: rgba(44, 38, 30, 0.14);
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid var(--guide-glass-edge);
          border-radius: 24px;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.58), rgba(255,248,232,0.22) 42%, rgba(255,255,255,0.34)),
            var(--guide-glass-bg);
          backdrop-filter: blur(18px) saturate(1.72) brightness(1.04);
          backdrop-filter: url(#guide-section-glass-filter) blur(18px) saturate(1.72) brightness(1.04);
          -webkit-backdrop-filter: blur(18px) saturate(1.72) brightness(1.04);
          box-shadow:
            0 16px 42px var(--guide-glass-shadow),
            0 2px 16px rgba(214,111,120,0.08),
            inset 0 1px 0 rgba(255,255,255,0.74),
            inset 0 -1px 0 rgba(255,255,255,0.28),
            inset 0 -22px 40px rgba(255,255,255,0.13);
        }

        .guide-liquid-section::before {
          content: "";
          position: absolute;
          inset: -35%;
          z-index: 0;
          border-radius: inherit;
          background:
            radial-gradient(circle at 18% 12%, rgba(255,255,255,0.78), transparent 18%),
            radial-gradient(circle at 86% 18%, rgba(217,180,111,0.22), transparent 24%),
            radial-gradient(circle at 76% 92%, rgba(15,118,110,0.10), transparent 24%),
            linear-gradient(115deg, transparent 18%, rgba(255,255,255,0.46) 34%, transparent 48%);
          mix-blend-mode: screen;
          opacity: 0.56;
          pointer-events: none;
          animation: guideLiquidGlint 10s ease-in-out infinite;
        }

        .guide-liquid-section::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          padding: 1px;
          border-radius: inherit;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.18) 35%, rgba(214,111,120,0.12) 58%, rgba(255,255,255,0.68));
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        .guide-liquid-section > * {
          position: relative;
          z-index: 1;
        }

        .guide-liquid-section--open {
          --guide-glass-bg: rgba(255, 248, 232, 0.48);
          --guide-glass-edge: rgba(255, 255, 255, 0.68);
          --guide-glass-shadow: rgba(44, 38, 30, 0.18);
        }

        .guide-liquid-trigger:hover {
          background: rgba(255, 255, 255, 0.26);
        }

        .guide-liquid-body {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,248,232,0.30)),
            rgba(255,248,232,0.18);
        }

        @media (prefers-reduced-motion: reduce) {
          .guide-liquid-section::before {
            animation: none;
          }
        }
      `}</style>

      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-16">
        <BookIllustration activeTitle={activeSection?.title ?? '选择一个章节展开'} />

        <section className="relative">
          <div className="mb-8 border-l-4 border-[#D66F78] bg-[#FFF8E8]/78 px-5 py-5 shadow-[0_16px_38px_rgba(44,38,30,0.12)]">
            <p className="mb-2 text-sm font-black uppercase text-[#D66F78]">UK Arrival Guide</p>
            <h1 className="text-4xl font-black leading-tight text-[#1D3557] sm:text-5xl">
              带英十一律
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#2C261E]/78">
              Keep Calm
            </p>
          </div>

          <div className="space-y-3" aria-label="带英十一律章节">
            {allGuideSections.map( ( section ) =>
            {
              const isOpen = section.id === openSectionId;
              return (
                <article
                  key={section.id}
                  className={`guide-liquid-section transition-[border-color,box-shadow,transform] duration-200 ${isOpen ? 'guide-liquid-section--open translate-x-0' : 'hover:-translate-y-0.5'
                    }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${section.id}-content`}
                    onClick={() => setOpenSectionId( isOpen ? '' : section.id )}
                    className="guide-liquid-trigger flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F766E] sm:px-5"
                  >
                    <span className="text-lg font-black leading-snug text-[#1D3557] sm:text-xl">
                      {section.title}
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-[#D66F78] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div
                    id={`${section.id}-content`}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="guide-liquid-body border-t border-white/38 px-4 pb-5 pt-4 sm:px-5">
                        {section.body}
                      </div>
                    </div>
                  </div>
                </article>
              );
            } )}
          </div>

          <section className="mt-8 border border-[#1D3557]/18 bg-[#1D3557] px-5 py-5 text-[#FFF8E8] shadow-[0_16px_38px_rgba(29,53,87,0.2)]">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#D9B46F]" />
              <h2 className="text-2xl font-black">官方信息为准</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[#FFF8E8]/78">
              页面是出发前后的提醒清单，涉及签证、医疗、报警和学生签证条件时，请以官方页面、学校邮件和个人 UKVI account 显示为准。
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {officialFooterLinks.map( ( link ) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 border-b border-[#D9B46F]/45 text-sm font-bold text-[#FFF8E8] transition-colors hover:text-[#D9B46F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9B46F]"
                >
                  {link.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
