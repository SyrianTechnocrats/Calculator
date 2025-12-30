import React, { useState, useEffect, useMemo } from 'react';
import { Coins, CheckSquare, Square, Info, AlertTriangle } from 'lucide-react';

interface PaymentSuggesterProps {
  amountOld: number;
}

const NEW_DENOMS = [500, 200, 100, 50, 25, 10];
const OLD_DENOMS = [5000, 2000, 1000, 500, 200, 100, 50];

const DenomToggle = ({ label, isChecked, onToggle, variant }: any) => {
  const activeClass = variant === 'new' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-amber-600 text-white border-amber-600';
  const inactiveClass = 'bg-gray-50 text-gray-400 border-gray-200';
  
  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-all font-bold text-sm ${isChecked ? activeClass : inactiveClass}`}
    >
      {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
      {label.toLocaleString('en-US')}
    </button>
  );
};

const PaymentSuggester: React.FC<PaymentSuggesterProps> = ({ amountOld }) => {
  const [checkedNew, setCheckedNew] = useState<Set<number>>(new Set(NEW_DENOMS));
  const [checkedOld, setCheckedOld] = useState<Set<number>>(new Set(OLD_DENOMS));

  const toggleNew = (d: number) => {
    const next = new Set(checkedNew);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setCheckedNew(next);
  };

  const toggleOld = (d: number) => {
    const next = new Set(checkedOld);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setCheckedOld(next);
  };

  const suggestion = useMemo(() => {
    if (amountOld <= 0) return null;

    let remainder = Math.round(amountOld);
    const result: { type: 'new' | 'old', denom: number, count: number }[] = [];

    // Try New First
    const availableNew = [...checkedNew].sort((a, b) => b - a);
    for (const d of availableNew) {
      const denomInOld = d * 100;
      const count = Math.floor(remainder / denomInOld);
      if (count > 0) {
        result.push({ type: 'new', denom: d, count });
        remainder -= count * denomInOld;
      }
    }

    // Try Old Next
    const availableOld = [...checkedOld].sort((a, b) => b - a);
    for (const d of availableOld) {
      const count = Math.floor(remainder / d);
      if (count > 0) {
        result.push({ type: 'old', denom: d, count });
        remainder -= count * d;
      }
    }

    return { 
      items: result, 
      isPossible: remainder === 0, 
      remainder,
      total: Math.round(amountOld) 
    };
  }, [amountOld, checkedNew, checkedOld]);

  return (
    <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-emerald-100 p-2 rounded-xl">
          <Coins size={20} className="text-emerald-700" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">الفئات المتاحة لديك حالياً</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 font-bold mb-2 pr-1">ليرات سورية (جديدة):</label>
          <div className="grid grid-cols-3 gap-2">
            {NEW_DENOMS.map(d => (
              <DenomToggle 
                key={`new-${d}`} 
                label={d} 
                variant="new"
                isChecked={checkedNew.has(d)} 
                onToggle={() => toggleNew(d)} 
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 font-bold mb-2 pr-1">ليرات سورية (قديمة):</label>
          <div className="grid grid-cols-3 gap-2">
            {OLD_DENOMS.map(d => (
              <DenomToggle 
                key={`old-${d}`} 
                label={d} 
                variant="old"
                isChecked={checkedOld.has(d)} 
                onToggle={() => toggleOld(d)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Payment Result */}
      <div className={`mt-6 rounded-2xl p-4 transition-all ${
        !suggestion ? 'bg-gray-50 border border-gray-100' : 
        suggestion.isPossible ? 'bg-emerald-50/50 border-2 border-emerald-500/20' : 'bg-red-50 border-2 border-red-200'
      }`}>
        {!suggestion ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm italic py-2 justify-center">
            <Info size={16} />
            أدخل مبلغاً في الأعلى لاقتراح طريقة دفع
          </div>
        ) : !suggestion.isPossible ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle size={18} />
              <span>لا يمكن تكوين هذا المبلغ بالفئات المحددة.</span>
            </div>
            <p className="text-xs text-red-600 pr-7">فعّل فئات إضافية (مثل الـ ٥٠ قديمة) أو عدّل المبلغ.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-emerald-700 font-bold opacity-70">كيفية الدفع المقترحة:</div>
            <div className="text-lg font-black text-emerald-900 flex flex-wrap gap-2 leading-relaxed" dir="rtl">
              {suggestion.items.map((item, idx) => (
                <span key={idx} className="bg-white px-2 py-0.5 rounded shadow-sm border border-emerald-100">
                  {item.count.toLocaleString('en-US')}×{item.denom.toLocaleString('en-US')} ({item.type === 'new' ? 'جديد' : 'قديم'})
                  {idx < suggestion.items.length - 1 && <span className="mr-2 text-gray-300">+</span>}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-emerald-200/50 flex justify-between items-center text-[10px] font-bold text-gray-500">
              <span>المجموع الكلي:</span>
              <span className="text-gray-700">{suggestion.total.toLocaleString('en-US')} ل.س (قديم)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuggester;