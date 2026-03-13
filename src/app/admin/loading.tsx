export default function AdminLoading() {
    return (
        <div className="space-y-6 animate-pulse p-6">
            <div className="flex justify-between items-center mb-10">
                <div className="h-10 bg-white/5 rounded-xl w-48"></div>
                <div className="h-10 bg-white/5 rounded-xl w-32"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl border border-white/5"></div>
                <div className="h-96 bg-white/5 rounded-2xl border border-white/5"></div>
            </div>
        </div>
    );
}
