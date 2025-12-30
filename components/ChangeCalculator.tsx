
import React, { useState, useEffect } from 'react';
import { Banknote, ShoppingCart, Wallet, AlertCircle, ArrowLeftRight } from 'lucide-react';

const ChangeCalculator: React.FC = () => {
  const [paid, setPaid] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [changeOld, setChangeOld] = useState<number | null>(null);
  const [changeNew, setChangeNew] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const p = parseFloat(paid);
    const s = parseFloat(price);

    if (!isNaN(p) && !isNaN(s)) {
      if (p >= s) {
        const diff = p - s; // الفرق بالعملة الجديدة
        setChangeNew(diff);
        setChangeOld(diff * 100); // التحويل للقديمة بالضرب في 100
        setError(false);
      } else {
        setChangeOld(null);
        setChangeNew(null);
        setError(true);
      }
    } else {
      setChangeOld(null);
      setChangeNew(null);
      setError(false);
    }
  }, [paid, price]);

  return (
    <div className="bg-white border-2 border-blue-100 rounded-3xl p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-blue-100 p-2 rounded-xl">
          <Wallet size={20} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">حاسبة الباقي (الفكة)</h2>
      </div>

      <div className="space-y-4">
        {/* المبلغ المدفوع بالجديد */}
        <div className="relative">
          <label className="block text-gray-600 text-sm mb-1.5 font-bold flex items-center gap-1">
            <Banknote size={14} /> المبلغ الذي دفعته للمحل بالعملة الجديدة:
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="مثال: 100"
            className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl py-4 px-4 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 text-right transition-all"
            value={paid}
            onChange={(e) => setPaid(e.target.value.replace(/[^0-9.]/g, ''))}
          />
        </div>

        {/* سعر القطعة بالجديد */}
        <div className="relative">
          <label className="block text-gray-600 text-sm mb-1.5 font-bold flex items-center gap-1">
            <ShoppingCart size={14} /> سعر الغرض بالعملة الجديدة:
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="مثال: 75"
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-4 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 text-right transition-all"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
          />
        </div>

        {/* النتيجة */}
        <div className={`mt-6 rounded-2xl overflow-hidden border-2 transition-all ${
          error ? 'bg-red-50 border-red-100' : 
          changeNew !== null ? 'bg-white border-emerald-100 shadow-md' : 'bg-gray-50 border-gray-100'
        }`}>
          {error ? (
            <div className="p-6 flex items-center justify-center gap-2 text-red-600 font-bold">
              <AlertCircle size={20} />
              <span className="text-lg">المبلغ المدفوع أقل من السعر!</span>
            </div>
          ) : changeNew !== null ? (
            <div className="flex flex-col">
              {/* الباقي بالجديد */}
              <div className="p-4 bg-white text-center">
                <span className="block text-xs text-blue-600 font-bold mb-1">الباقي بالليرة (الجديدة):</span>
                <div className="text-3xl font-black text-blue-700">
                  {changeNew.toLocaleString('ar-SY')}
                  <span className="text-sm mr-2 opacity-70">ل.س</span>
                </div>
              </div>

              <div className="flex justify-center -my-2 z-10">
                <div className="bg-white rounded-full p-1 border shadow-sm">
                  <ArrowLeftRight size={14} className="text-gray-400 rotate-90" />
                </div>
              </div>

              {/* الباقي بالقديم */}
              <div className="p-4 bg-emerald-50/50 border-t border-emerald-100 text-center">
                <span className="block text-xs text-emerald-700 font-bold mb-1">الباقي بالليرة (القديمة):</span>
                <div className="text-3xl font-black text-emerald-800">
                  {changeOld?.toLocaleString('ar-SY')}
                  <span className="text-sm mr-2 opacity-70">ل.س</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400 font-bold italic">
              أدخل المبالغ (بالعملة الجديدة) لعرض الباقي
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeCalculator;
