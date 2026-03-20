import { Mail, MessageSquare } from 'lucide-react';

export default function ContactPage()
{
  return (
    <div className="pt-16">
      <section className="relative h-[35vh] min-h-[280px] flex items-center justify-center bg-[#1D3557]">
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact</h1>
          <p className="text-xl text-white/80">有推荐或纠错？欢迎联系我们</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="bg-[#F1FAEE] rounded-2xl p-8">
              <Mail className="w-10 h-10 text-[#E63946] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#1D3557] mb-2">Email</h2>
              <p className="text-gray-600">林北先放这</p>
            </div>
            <div className="bg-[#F1FAEE] rounded-2xl p-8">
              <MessageSquare className="w-10 h-10 text-[#2A9D8F] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#1D3557] mb-2">反馈建议</h2>
              <p className="text-gray-600">
                如果你有新的餐厅推荐、景点避雷或生活 tips，欢迎直接私米勒！
                我们会持续更新内容
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
