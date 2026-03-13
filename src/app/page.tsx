import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse transition-all duration-1000" />

      <main className="relative z-10 text-center px-6">
        <div className="mb-12 inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-primary shadow-[0_0_50px_rgba(212,175,55,0.3)] animate-float">
          <span className="material-symbols-outlined text-background-dark text-5xl">content_cut</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
            Duyen<span className="text-primary">Hair</span>Salon
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Hệ thống quản trị salon tóc chuyên nghiệp, đẳng cấp và hiện đại.
          </p>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/admin"
            className="group relative px-10 py-5 bg-primary rounded-2xl text-background-dark font-black text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <span className="material-symbols-outlined">dashboard_customize</span>
            Vào trang quản trị
          </Link>

          <Link
            href="/login"
            className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-3"
          >
            <span className="material-symbols-outlined">login</span>
            Đăng nhập lại
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: 'calendar_month', title: 'Lịch hẹn', desc: 'Quản lý lịch đặt chỗ thông minh' },
            { icon: 'groups', title: 'Nhân sự', desc: 'Theo dõi hiệu suất nhân viên' },
            { icon: 'payments', title: 'Tài chính', desc: 'Báo cáo doanh thu chi tiết' }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-primary/30 transition-colors group">
              <span className="material-symbols-outlined text-primary text-4xl mb-4 group-hover:scale-110 transition-transform block">{feature.icon}</span>
              <h3 className="text-white font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="absolute bottom-10 left-0 right-0 text-center text-slate-600 text-sm">
        &copy; 2026 Duyen Hair Salon. All rights reserved.
      </footer>
    </div>
  );
}
