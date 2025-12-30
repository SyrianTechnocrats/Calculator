
import React, { useState } from 'react';
import { Copy, Check, RotateCcw, DollarSign } from 'lucide-react';

interface ConverterCardProps {
  usdRate: number | null;
}

const InputField = ({ label, value, onChange, placeholder, suffix, colorClass, badge, icon }: any) => (
  <div className="relative group">
    <label className="block text-gray-500 text-sm mb-1.5 pr-1 font-semibold flex justify-between items-center">
      <span className="flex items-center gap-1">{icon}{label}</span>
      {badge && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded font-bold">{badge}</span>}
    </label>
    <div className={`flex items-center rounded-2xl px-4 py-1 transition-all border ${colorClass} focus-within:bg-white focus-within:ring-2 focus-within:border-transparent`}>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        className="w-full bg-transparent py-4 text-2xl font-bold focus:outline-none text-right placeholder-opacity-40"
        value={value}
        onChange={onChange}
      />
      <span className="font-bold mr-3 text-sm opacity-60 whitespace-nowrap">{suffix}</span>
    </div>
  </div>
);

const ConverterCard: React.FC<ConverterCardProps> = ({ usdRate }) => {
  const [oldValue, setOldValue] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [usdValue, setUsdValue] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<'old' | 'new' | 'usd' | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const formatValue = (val: number) => {
    return Number(val.toFixed(2)).toString();
  };

  const handleOldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setOldValue(val);
    setLastUpdated('old');
    if (val === '' || val === '.') {
      setNewValue('');
      setUsdValue('');
    } else {
      const num = parseFloat(val);
      setNewValue(formatValue(num / 100));
      if (usdRate) setUsdValue(formatValue(num / usdRate));
    }
  };

  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setNewValue(val);
    setLastUpdated('new');
    if (val === '' || val === '.') {
      setOldValue('');
      setUsdValue('');
    } else {
      const num = parseFloat(val);
      const old = num * 100;
      setOldValue(formatValue(old));
      if (usdRate) setUsdValue(formatValue(old / usdRate));
    }
  };

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setUsdValue(val);
    setLastUpdated('usd');
    if (val === '' || val === '.' || !usdRate) {
      setOldValue('');
      setNewValue('');
    } else {
      const num = parseFloat(val);
      const old = num * usdRate;
      setOldValue(formatValue(old));
      setNewValue(formatValue(old / 100));
    }
  };

  const resetFields = () => {
    setOldValue('');
    setNewValue('');
    setUsdValue('');
    setLastUpdated(null);
  };

  const copyToClipboard = () => {
    let textToCopy = '';
    if (lastUpdated === 'old') textToCopy = oldValue;
    else if (lastUpdated === 'new') textToCopy = newValue;
    else if (lastUpdated === 'usd') textToCopy = usdValue;

    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <InputField 
        label="الليرة السورية (القديمة)" 
        value={oldValue} 
        onChange={handleOldChange}
        placeholder="مثال: 50000"
        suffix="ل.س"
        colorClass="bg-gray-100 focus-within:ring-emerald-500"
      />

      <InputField 
        label="الليرة السورية (الجديدة)" 
        value={newValue} 
        onChange={handleNewChange}
        placeholder="مثال: 500"
        suffix="ل.س"
        colorClass="bg-emerald-50 border-emerald-100 focus-within:ring-emerald-500"
        badge="بعد الحذف"
      />

      <div className="pt-2">
        <InputField 
          label="الدولار الأمريكي" 
          value={usdValue} 
          onChange={handleUsdChange}
          placeholder="مثال: 10"
          suffix="$"
          icon={<DollarSign size={14} className="text-blue-500" />}
          colorClass="bg-blue-50 border-blue-100 focus-within:ring-blue-500"
          badge="سعر رسمي"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <button 
          onClick={copyToClipboard}
          disabled={!oldValue && !newValue && !usdValue}
          className="flex items-center justify-center gap-2 py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
          {copied ? 'تم النسخ' : 'نسخ القيمة'}
        </button>
        <button 
          onClick={resetFields}
          className="flex items-center justify-center gap-2 py-4 px-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-2xl font-bold transition-all active:scale-95"
        >
          <RotateCcw size={20} />
          مسح الكل
        </button>
      </div>
    </div>
  );
};

export default ConverterCard;
