import Link from 'next/link';
import LondonStreetHero from '@/components/LondonStreetHero';
import LondonCityGuide from '@/components/LondonCityGuide';

export default function LondonPage()
{
  const londonFacts = [
    {
      stat: '£1.75',
      label: 'Bus hopper',
      title: '伦敦公交不收现金，而且一小时内可以无限换乘',
      body: (
        <>
          伦敦公交车只能使用 Oyster、银行卡或手机感应支付，不能上车后拿现金买票。成人单程目前是 £1.75；首次刷卡后的一小时内，可以无限换乘其他公交车和有轨电车，仍只收一次费用。这使得大伦敦的巴士费用，意外地成了英国城市里非常便宜的一档。
        </>
      ),
    },
    {
      stat: '5 min',
      label: 'Walk or Tube',
      title: '在伦敦，走路有时比坐车还快',
      body: (
        <>
          伦敦因为城市设计过早，交通非常糟。有时候叫 Uber 真不如 Tube 快；在市中心，走路甚至可能比坐地铁更快。地铁线路图主要为了清晰展示换乘关系，并不是按真实地理距离绘制。很多站实际非常近，例如 Monument 到 London Bridge 约 5 分钟，可能比坐地铁快约 12 分钟。
        </>
      ),
    },
    {
      stat: 'FREE',
      label: 'Museums',
      title: '伦敦很贵，但很多博物馆免费',
      body: (
        <>
          伦敦是世界上生活成本最高的城市之一，但大英博物馆、国家美术馆、自然历史博物馆、科学博物馆、V&amp;A 等大型国家级博物馆，永久展览通常免费。想看具体推荐可以去{' '}
          <Link href="/london/attractions">
            Attractions 页面
          </Link>
          。
        </>
      ),
    },
    {
      stat: '300+',
      label: 'Languages',
      title: '伦敦居民日常使用超过 300 种语言',
      body: (
        <>
          伦敦每天都有人使用的语言超过 300 种，属于世界上语言最丰富的城市之一。2021 Census 中，White 总体只有 50% 出头，White British 约 36.8%，所以它不是一个单一文化城市，而是一座把世界压缩到同一张地铁图上的城市。
        </>
      ),
    },
    {
      stat: '195',
      label: 'Food map',
      title: '真的是美食荒漠吗？',
      body: (
        <>
          伦敦拥有来自 195 个国家和地区菜系的餐厅。中餐这几年也发展得很快，从江浙菜、西安菜、潮汕火锅，到云南菜都有，奶茶连锁店也在扩张。“英国，伦敦没有好吃的”已经是个林北都懒得和人解释的cliche了。当然，在外面吃饭不便宜，毕竟人力有着最低 £12/h 左右的底线。
        </>
      ),
    },
  ];

  return (
    <div className="relative pt-16 overflow-x-clip bg-[#F3F0E7]">
      <LondonStreetHero />
      <LondonCityGuide facts={londonFacts} />
    </div>
  );
}
