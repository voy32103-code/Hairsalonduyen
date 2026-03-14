'use client';

import { useState, useMemo } from 'react';
import { createInvoice } from '@/actions/invoices';
import { validatePromoCode } from '@/actions/promo_codes';
import { getCustomerPackages } from '@/actions/packages';
import { useRouter } from 'next/navigation';

export default function POSLayout({ appointments, services, products, packages }: { appointments: any[], services: any[], products: any[], packages: any[] }) {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [discount, setDiscount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<any>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [customerPackages, setCustomerPackages] = useState<any[]>([]);
    const [redeemedPackages, setRedeemedPackages] = useState<{[key: string]: string}>({}); // cartId -> customerPackageId

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const subtotal = useMemo(() => cart.reduce((sum, item) => {
        const isRedeemed = redeemedPackages[item.cartId];
        return sum + (item.quantity * (isRedeemed ? 0 : item.price));
    }, 0), [cart, redeemedPackages]);

    const total = Math.max(0, subtotal - discount);

    const handleRedeem = (cartId: string, pkgId: string) => {
        if (pkgId === "") {
            const newRedeemed = {...redeemedPackages};
            delete newRedeemed[cartId];
            setRedeemedPackages(newRedeemed);
        } else {
            setRedeemedPackages(prev => ({...prev, [cartId]: pkgId}));
        }
    };

    const handleSelectAppointment = (appId: string) => {
        if (!appId) {
            setSelectedAppointment(null);
            setCart([]);
            setCustomerPackages([]);
            setRedeemedPackages({});
            return;
        }

        const app = appointments.find(a => a.id === appId);
        if (app) {
            setSelectedAppointment(app);
            // Fetch customer packages if appointment has customer
            if (app.customer_id) {
                getCustomerPackages(app.customer_id).then(setCustomerPackages);
            }
            // Pre-fill cart with the appointment's service
            setCart([{
                type: 'service',
                id: app.service_id,
                name: app.service_name,
                price: Number(app.price),
                quantity: 1,
                cartId: `app_${app.id}`
            }]);
        }
    };

    const addToCart = (item: any, type: 'service' | 'product' | 'package') => {
        setCart(prev => {
            const existing = prev.find(i => i.type === type && i.id === item.id);
            if (existing) {
                return prev.map(i => i.cartId === existing.cartId ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, {
                type,
                id: item.id,
                name: type === 'product' ? item.product_name : item.name,
                price: type === 'product' ? Number(item.unit_price) : Number(item.price),
                quantity: 1,
                cartId: `${type}_${item.id}_${Date.now()}`
            }];
        });
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.cartId === cartId) {
                const newQ = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQ };
            }
            return i;
        }));
    };

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(i => i.cartId !== cartId));
        // Also remove redemption
        if (redeemedPackages[cartId]) {
            const newRedeemed = {...redeemedPackages};
            delete newRedeemed[cartId];
            setRedeemedPackages(newRedeemed);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setPromoLoading(true);
        const res = await validatePromoCode(promoCode);
        setPromoLoading(false);
        if (res.success && res.promo) {
            setAppliedPromo(res.promo);
            let disc = 0;
            if (res.promo.discountType === 'percent') {
                disc = (subtotal * res.promo.discountValue) / 100;
            } else {
                disc = res.promo.discountValue;
            }
            setDiscount(disc);
            alert(`✅ Đã áp dụng mã: ${res.promo.code}`);
        } else {
            alert(res.message || 'Lỗi mã');
            setAppliedPromo(null);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Giỏ hàng trống!');
        
        // Enforce customer selection for packages
        const hasPackage = cart.some(i => i.type === 'package');
        if (hasPackage && !selectedAppointment?.customer_id) {
            return alert('Vui lòng chọn khách hàng (qua lịch hẹn) để mua gói dịch vụ.');
        }

        setLoading(true);

        const payload = {
            appointmentId: selectedAppointment?.id || null,
            customerId: selectedAppointment?.customer_id || null,
            discount: Number(discount),
            promoCodeId: appliedPromo?.id || null,
            paymentMethod,
            note,
            items: cart.map(i => ({
                serviceId: i.type === 'service' ? i.id : null,
                productId: i.type === 'product' ? i.id : null,
                packageId: i.type === 'package' ? i.id : null,
                itemName: i.name,
                quantity: i.quantity,
                unitPrice: redeemedPackages[i.cartId] ? 0 : i.price,
                customerPackageId: redeemedPackages[i.cartId] || null,
                staffId: selectedAppointment?.staff_id || null // Default to appointment staff
            }))
        };

        try {
            const res = await createInvoice(payload);
            setLoading(false);

            if (res.success) {
                alert(`✅ Thanh toán thành công!\nMã HĐ: #${res.invoiceId?.split('-')[0]}`);
                setSuccessMessage(`Thanh toán thành công! Mã HĐ: #${res.invoiceId?.split('-')[0]}`);
                setCart([]);
                setSelectedAppointment(null);
                setDiscount(0);
                setAppliedPromo(null);
                setPromoCode('');
                setRedeemedPackages({});
                setNote('');
                router.refresh();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                alert(`❌ Thất bại: ${res.message}`);
            }
        } catch (error: any) {
            setLoading(false);
            alert(`❌ Lỗi hệ thống: ${error.message}`);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
                <div className="glass-card rounded-2xl p-4 border border-white/5 flex shrink-0">
                    <div className="w-full space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn Lịch hẹn để thanh toán (Tùy chọn)</label>
                        <select 
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                            value={selectedAppointment?.id || ''}
                            onChange={(e) => handleSelectAppointment(e.target.value)}
                        >
                            <option value="">-- Mua lẻ không qua lịch hẹn --</option>
                            {appointments.map(a => (
                                <option key={a.id} value={a.id}>
                                    {new Date(a.appointment_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {a.customer_name} ({a.service_name})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex-1 grid grid-rows-3 gap-6 min-h-0">
                    {/* Services section */}
                    <div className="glass-card rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">content_cut</span> 
                                Dịch vụ bổ sung
                            </h3>
                        </div>
                        <div className="p-4 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {services.map(s => (
                                <button key={s.id} onClick={() => addToCart(s, 'service')} className="p-3 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all border border-white/5 rounded-xl text-left flex flex-col h-full group">
                                    <span className="font-bold text-sm text-slate-200 group-hover:text-primary transition-colors flex-1">{s.name}</span>
                                    <span className="text-xs text-primary font-black mt-2">{formatCurrency(Number(s.price))}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products section */}
                    <div className="glass-card rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">inventory_2</span> 
                                Sản phẩm bán lẻ
                            </h3>
                        </div>
                        <div className="p-4 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {products.map(p => (
                                <button 
                                    key={p.id} 
                                    onClick={() => addToCart(p, 'product')}
                                    disabled={p.quantity <= 0}
                                    className={`p-3 border rounded-xl text-left flex flex-col h-full transition-all group ${p.quantity <= 0 ? 'bg-rose-500/5 text-slate-500 opacity-50 border-rose-500/20 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 hover:border-primary/50 border-white/5'}`}
                                >
                                    <span className="font-bold text-sm group-hover:text-primary transition-colors flex-1 line-clamp-2">{p.product_name}</span>
                                    <div className="flex justify-between items-center w-full mt-2">
                                        <span className="text-xs font-black text-slate-300">{formatCurrency(Number(p.unit_price))}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${p.quantity > 0 ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-400'}`}>Kho: {p.quantity}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Packages section */}
                    <div className="glass-card rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">card_membership</span> 
                                Gói dịch vụ trả trước
                            </h3>
                        </div>
                        <div className="p-4 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {packages.map(pkg => (
                                <button key={pkg.id} onClick={() => addToCart(pkg, 'package')} className="p-3 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all border border-white/5 rounded-xl text-left flex flex-col h-full group">
                                    <span className="font-bold text-sm text-slate-200 group-hover:text-primary transition-colors flex-1">{pkg.name}</span>
                                    <div className="mt-2 text-right">
                                        <span className="text-[10px] text-slate-500 block uppercase font-bold">{pkg.total_credits} lượt sử dụng</span>
                                        <span className="text-sm text-primary font-black">{formatCurrency(Number(pkg.price))}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-96 glass-card rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-white/5 bg-primary/5">
                    <h2 className="text-xl font-black text-white flex items-center justify-between">
                        Giỏ hàng
                        <span className="text-xs font-bold bg-primary text-[#111827] px-2 py-1 rounded-lg">{cart.length} món</span>
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(item => (
                        <div key={item.cartId} className="flex flex-col p-3 bg-white/5 rounded-xl border border-white/5 gap-2">
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-sm font-bold text-slate-200 line-clamp-2">{item.name}</span>
                                <button onClick={() => removeFromCart(item.cartId)} className="text-slate-500 hover:text-rose-400 mt-0.5"><span className="material-symbols-outlined text-sm">close</span></button>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <div className="flex flex-col">
                                    <span className={`text-xs font-black ${redeemedPackages[item.cartId] ? 'text-slate-500 line-through' : 'text-primary'}`}>
                                        {formatCurrency(item.price)}
                                    </span>
                                    {item.type === 'service' && customerPackages.length > 0 && (
                                        <select 
                                            value={redeemedPackages[item.cartId] || ''} 
                                            onChange={(e) => handleRedeem(item.cartId, e.target.value)}
                                            className="mt-1 bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold rounded px-1 py-0.5 outline-none"
                                        >
                                            <option value="">-- Dùng Gói --</option>
                                            {customerPackages.map(cp => (
                                                <option key={cp.id} value={cp.id}>{cp.package_name} ({cp.remaining_credits} lượt)</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 bg-slate-900 p-0.5 rounded-lg border border-white/5">
                                    <button onClick={() => updateQuantity(item.cartId, -1)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-400 font-bold">-</button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.cartId, 1)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-400 font-bold">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 pt-10 opacity-60">
                            <span className="material-symbols-outlined text-5xl mb-3">shopping_cart</span>
                            <p className="text-sm font-medium">Chưa có sản phẩm / dịch vụ</p>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-white/5 bg-white/[0.02] space-y-4 shrink-0">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã giảm giá</label>
                            <div className="flex gap-2">
                                <input value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-primary outline-none uppercase" placeholder="Voucher..." disabled={!!appliedPromo} />
                                {appliedPromo ? <button onClick={() => { setAppliedPromo(null); setDiscount(0); setPromoCode(''); }} className="px-3 py-2 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-bold border border-rose-500/20">Hủy</button> : <button onClick={handleApplyPromo} disabled={promoLoading || !promoCode} className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20 hover:bg-primary/20">{promoLoading ? '...' : 'Áp dụng'}</button>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giảm thủ công</label>
                                <input type="number" value={discount} onChange={e => { setDiscount(Number(e.target.value) || 0); setAppliedPromo(null); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-primary outline-none" min="0" disabled={!!appliedPromo} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phương thức</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs focus:border-primary outline-none appearance-none">
                                    <option value="cash">Tiền mặt</option>
                                    <option value="credit_card">Thẻ / Quẹt POS</option>
                                    <option value="bank_transfer">Chuyển khoản</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Tạm tính:</span><span className="text-white font-medium">{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Khuyến mãi:</span><span className="text-rose-400 font-medium">-{formatCurrency(discount)}</span></div>
                        <div className="flex justify-between text-xl border-t border-dashed border-white/10 pt-2 pb-1"><span className="text-slate-300 font-bold">Thành tiền:</span><span className="text-primary font-black">{formatCurrency(total)}</span></div>
                    </div>
                    <button onClick={handleCheckout} disabled={loading || cart.length === 0} className="w-full py-4 rounded-xl bg-primary text-[#111827] font-black uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                        {loading ? <span className="w-5 h-5 border-2 border-[#111827]/40 border-t-[#111827] rounded-full animate-spin" /> : 'Thanh toán'}
                    </button>
                    {successMessage && <div className="mt-2 bg-green-500/10 text-green-400 text-[10px] font-bold p-2 rounded-lg border border-green-500/20 text-center">{successMessage}</div>}
                </div>
            </div>
        </div>
    );
}
