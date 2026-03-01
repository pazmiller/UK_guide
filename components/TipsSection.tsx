import { Lightbulb } from 'lucide-react';
import { CityTip } from '@/data/types';

interface TipsSectionProps {
  tips: CityTip[];
  title?: string;
}

export default function TipsSection({ tips, title = '生活小贴士' }: TipsSectionProps) {
  if (tips.length === 0) return null;

  return (
    <section className="py-12 bg-blue-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Lightbulb className="w-6 h-6 text-[#F4A261]" />
          <h2 className="text-2xl font-bold text-[#1D3557]">{title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="bg-white border border-blue-100 rounded-xl p-4 flex items-start gap-3"
            >
              <span className="text-[#F4A261] font-bold text-lg mt-[-2px]">·</span>
              <p className="text-gray-700 text-sm">{tip.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
