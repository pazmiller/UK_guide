import { AlertTriangle } from 'lucide-react';
import { AvoidItem } from '@/data/types';

interface AvoidSectionProps {
  items: AvoidItem[];
  title?: string;
}

export default function AvoidSection({ items, title = '避雷指南' }: AvoidSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-red-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle className="w-6 h-6 text-[#E63946]" />
          <h2 className="text-2xl font-bold text-[#1D3557]">{title}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-red-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-[#1D3557] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#E63946] rounded-full flex-shrink-0" />
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
