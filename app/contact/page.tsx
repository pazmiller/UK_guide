import { Mail, MessageSquare } from 'lucide-react';

export default function ContactPage()
{
  return (
    <div className="pt-16 bg-[#FBF8F1]">
      <section className="relative py-14 md:py-20 border-b border-[#1D3557]/10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1D3557] mb-4">Contact</h1>
          <p className="text-xl text-[#1D3557]/70">有推荐或纠错？欢迎联系我们</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-5">
            <div className="bg-white rounded-lg p-8 shadow-sm ring-1 ring-[#1D3557]/10">
              <Mail className="w-10 h-10 text-[#E63946] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#1D3557] mb-2">Email</h2>
              <p className="text-gray-600">林北先放这</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm ring-1 ring-[#1D3557]/10">
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
