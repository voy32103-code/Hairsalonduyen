export default function RootLoading() {
    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
            </div>
            <p className="mt-8 text-slate-500 font-bold uppercase tracking-[0.3em] animate-pulse">
                Đang tải dữ liệu...
            </p>
        </div>
    );
}
