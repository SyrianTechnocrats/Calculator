import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, RefreshCw, AlertCircle, WifiOff, Share, Download } from 'lucide-react';
import ConverterCard from './components/ConverterCard';
import ChangeCalculator from './components/ChangeCalculator';

const CACHE_KEY = 'syp_usd_rate';
const CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 ساعة

const App: React.FC = () => {
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  
  // PWA States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  const fetchRate = async (force = false) => {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      const { rate, timestamp } = JSON.parse(saved);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
      
      if (!force && !isExpired) {
        setUsdRate(rate);
        return;
      }
      
      if (!navigator.onLine) {
        setUsdRate(rate);
        return;
      }
    }

    if (!navigator.onLine) {
        setIsOffline(true);
        return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
      const data = await response.json();
      if (data && data.usd && data.usd.syp) {
        const rate = data.usd.syp;
        setUsdRate(rate);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }));
        setIsOffline(false);
      }
    } catch (error) {
      console.error("Error fetching rate:", error);
      setIsOffline(true);
      if (saved) setUsdRate(JSON.parse(saved).rate);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
    const handleOnline = () => { setIsOffline(false); fetchRate(); };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install logic
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Check if already installed
    const standalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-xl md:my-4 md:rounded-3xl overflow-hidden font-['Cairo']">
      {/* Header */}
      <header className="bg-[#17683c] p-6 text-white text-center shadow-md relative">
        <div className="absolute top-4 right-4 opacity-10">
            <Calculator size={56} />
        </div>
        
        <h1 className="text-3xl font-bold mb-3">محول الليرة السورية</h1>
        
        {/* USD Rate Badge */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-[#135a34]/60 border border-white/20 px-4 py-2 rounded-2xl inline-flex items-center gap-2 shadow-inner">
            <TrendingUp size={16} className="text-emerald-300" />
            <span className="text-sm font-semibold">سعر الدولار الرسمي:</span>
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <span className="text-lg font-black text-white">
                {usdRate ? `${Math.round(usdRate).toLocaleString('ar-SY')} ل.س` : '---'}
              </span>
            )}
            <button 
              onClick={() => fetchRate(true)} 
              className="p-1 hover:bg-emerald-500 rounded-full transition-colors"
              title="تحديث السعر"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Warning & Offline Note */}
          <div className="space-y-1 w-full max-w-[90%] mx-auto">
            <div className="bg-amber-500/20 border border-amber-400/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] text-amber-100 justify-center">
              <AlertCircle size={12} className="shrink-0" />
              <p className="font-bold">سعر الدولار هو السعر المركزي فقط وليس سعر السوق السوداء</p>
            </div>
            {isOffline && (
                <div className="bg-red-500/30 border border-red-400/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] text-red-100 justify-center animate-pulse">
                    <WifiOff size={12} className="shrink-0" />
                    <p className="font-bold">أنت تعمل الآن بدون إنترنت</p>
                </div>
            )}
          </div>
        </div>
      </header>

      {/* Install PWA Banner */}
      {!isStandalone && (
        <div className="px-6 py-4">
          {showInstallBtn ? (
            <button 
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-md active:scale-95"
            >
              <Download size={20} />
              أضف التطبيق إلى الهاتف
            </button>
          ) : isIOS ? (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 text-blue-800 text-sm">
              <Share size={24} className="shrink-0 text-blue-600" />
              <p className="font-bold">
                لتثبيت التطبيق: اضغط زر <span className="underline italic">المشاركة</span> ثم اختر <span className="underline italic">"Add to Home Screen"</span>
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow p-6 pt-2 space-y-8 overflow-y-auto">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-[#17683c] rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-700">تحويل الليرة السورية القديمة والجديدة</h2>
          </div>
          <ConverterCard usdRate={usdRate} />
        </section>

        <section className="pb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-700">حاسبة التسوق والباقي</h2>
          </div>
          <ChangeCalculator />
        </section>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px]">
          Developed by Bader Bayaa
        </p>
      </footer>
    </div>
  );
};

export default App;