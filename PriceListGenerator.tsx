import React, { useState, useRef, useCallback } from 'react';
import { Download, Share2, Trash2, PlusCircle } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { BusinessInfo, ProductList, Product } from '../types';

const initialBusinessInfo: BusinessInfo = {
  brandName: '',
  phone: '',
  instagram: '',
  telegram: '',
  whatsapp: '',
};
const initialProducts: ProductList = { greenBean: [], coffee: [], powders: [] };

const PriceListPreview: React.FC<{
  businessInfo: BusinessInfo;
  products: ProductList;
  innerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ businessInfo, products, innerRef }) => {
  const categories: { key: keyof ProductList; title: string }[] = [
    { key: 'coffee', title: 'قهوه (رُست شده)' },
    { key: 'greenBean', title: 'دانه سبز' },
    { key: 'powders', title: 'پودریجات' },
  ];

  const activeCount = categories.filter((c) => products[c.key].length > 0).length;

  const gridClass =
    activeCount === 3 ? 'grid-cols-3' : activeCount === 2 ? 'grid-cols-2' : 'grid-cols-1';

  const itemPadding = activeCount > 1 ? 'p-2' : 'p-3';
  const nameSize = activeCount > 1 ? 'text-sm' : 'text-xl';
  const priceSize = activeCount > 1 ? 'text-sm' : 'text-xl';
  const titleSize = activeCount > 1 ? 'text-lg' : 'text-2xl';

  return (
    <div
      ref={innerRef}
      className="font-vazir bg-gray-900 text-gray-800 p-0 w-[800px] aspect-[1/1.414] scale-[0.35] origin-top-left sm:scale-100 sm:origin-center sm:w-full sm:max-w-lg sm:aspect-auto rounded-none sm:rounded-lg overflow-hidden"
    >
      <div
        className="h-full relative p-8 flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
          backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-matter.png')`,
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

        <header className="text-center mb-6 relative z-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 drop-shadow-sm">
            {businessInfo.brandName || 'نام برند شما'}
          </h1>
        </header>

        <main className={`flex-grow relative z-10 grid ${gridClass} gap-4 content-start`}>
          {categories.map(({ key, title }) => (
            products[key].length > 0 && (
              <div key={key} className="flex flex-col">
                <h2 className={`${titleSize} font-bold mb-3 text-amber-400 border-b border-amber-500/30 pb-2 inline-block pr-2 pl-2 border-r-4 border-r-amber-500`}>
                  {title}
                </h2>
                <div className="space-y-2">
                  {products[key].map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white/5 backdrop-blur-sm ${itemPadding} rounded-lg flex justify-between items-center border border-white/10`}
                    >
                      <span className={`font-semibold text-gray-200 ${nameSize} truncate pl-2`}>{item.name}</span>
                      <span className={`font-bold text-amber-400 font-mono-digital ${priceSize} whitespace-nowrap`}>
                        {Number(item.price).toLocaleString('fa-IR')}
                        {activeCount === 1 && <span className="text-xs mr-2 text-gray-500">تومان</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </main>

        <footer className="mt-8 pt-6 border-t border-gray-700 relative z-10">
          <div className="flex justify-center items-center gap-6 flex-wrap text-gray-400 text-sm font-mono-digital">
            {businessInfo.phone && <span>📞 {businessInfo.phone}</span>}
            {businessInfo.instagram && <span>📷 @{businessInfo.instagram}</span>}
            {businessInfo.telegram && <span>✈️ @{businessInfo.telegram}</span>}
            {businessInfo.whatsapp && <span>💬 {businessInfo.whatsapp}</span>}
          </div>
        </footer>
      </div>
    </div>
  );
};

export const PriceListGenerator: React.FC = () => {
  const [businessInfo, setBusinessInfo] = useLocalStorage<BusinessInfo>(
    'priceListBusinessInfo',
    initialBusinessInfo
  );
  const [products, setProducts] = useLocalStorage<ProductList>('priceListProducts', initialProducts);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleBusinessInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessInfo({ ...businessInfo, [e.target.name]: e.target.value });
  };

  const addProduct = (category: keyof ProductList) => {
    const newProduct: Product = { id: Date.now().toString(), name: '', price: '' };
    setProducts({ ...products, [category]: [...products[category], newProduct] });
  };

  const updateProduct = (
    category: keyof ProductList,
    id: string,
    field: keyof Product,
    value: string
  ) => {
    const updatedProducts = products[category].map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setProducts({ ...products, [category]: updatedProducts });
  };

  const removeProduct = (category: keyof ProductList, id: string) => {
    const filteredProducts = products[category].filter((p) => p.id !== id);
    setProducts({ ...products, [category]: filteredProducts });
  };

  const handleReset = () => {
    if (window.confirm('آیا میخواهید تمام اطلاعات لیست قیمت را پاک کنید؟')) {
      setBusinessInfo(initialBusinessInfo);
      setProducts(initialProducts);
    }
  };

  const generateImage = useCallback(async (format: 'png' | 'jpeg' | 'blob') => {
    if (!previewRef.current || !(window as any).htmlToImage) {
        alert("Library not loaded or element not found");
        return null;
    }
    setIsGenerating(true);
    try {
      const htmlToImage = (window as any).htmlToImage;
      const options = { quality: 0.95, pixelRatio: 2, width: 800, height: 1128 };
      if (format === 'png') return await htmlToImage.toPng(previewRef.current, options);
      if (format === 'jpeg') return await htmlToImage.toJpeg(previewRef.current, options);
      if (format === 'blob') return await htmlToImage.toBlob(previewRef.current, options);
    } catch (error) {
      console.error('oops, something went wrong!', error);
      alert('خطا در ساخت تصویر. لطفاً دوباره تلاش کنید.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleDownload = async () => {
    const dataUrl = await generateImage('jpeg');
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `${businessInfo.brandName || 'pricelist'}.jpeg`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleShare = async () => {
    const blob = (await generateImage('blob')) as Blob;
    if (blob && navigator.share) {
      const file = new File([blob], `${businessInfo.brandName || 'pricelist'}.jpeg`, {
        type: 'image/jpeg',
      });
      try {
        await navigator.share({
          title: `لیست قیمت ${businessInfo.brandName}`,
          text: `لیست قیمت محصولات ما`,
          files: [file],
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      alert(
        'مرورگر شما از قابلیت اشتراک‌گذاری پشتیبانی نمی‌کند. لطفاً تصویر را دانلود کرده و به صورت دستی به اشتراک بگذارید.'
      );
    }
  };

  const ProductInputGroup: React.FC<{ title: string; categoryKey: keyof ProductList }> = ({
    title,
    categoryKey,
  }) => (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-amber-300">{title}</h3>
      <div className="space-y-3">
        {products[categoryKey].map((item) => (
          <div key={item.id} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="نام محصول"
              value={item.name}
              onChange={(e) => updateProduct(categoryKey, item.id, 'name', e.target.value)}
              className="flex-grow bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:border-amber-500 outline-none text-sm"
            />
            <input
              type="number"
              placeholder="قیمت"
              value={item.price}
              onChange={(e) => updateProduct(categoryKey, item.id, 'price', e.target.value)}
              className="w-24 bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:border-amber-500 outline-none text-sm text-center"
            />
            <button
              onClick={() => removeProduct(categoryKey, item.id)}
              className="text-gray-500 hover:text-red-500 p-1"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => addProduct(categoryKey)}
          className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 pt-2 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> افزودن محصول
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto lg:grid lg:grid-cols-2 lg:gap-8 pb-20">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center text-amber-400">ابزار ساخت لیست قیمت</h1>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-amber-300">اطلاعات کسب‌وکار</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              name="brandName"
              value={businessInfo.brandName}
              onChange={handleBusinessInfoChange}
              placeholder="نام برند"
              className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-amber-500 outline-none"
            />
            <input
              name="phone"
              value={businessInfo.phone}
              onChange={handleBusinessInfoChange}
              placeholder="شماره تماس"
              className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-amber-500 outline-none"
            />
            <input
              name="instagram"
              value={businessInfo.instagram}
              onChange={handleBusinessInfoChange}
              placeholder="اینستاگرام"
              className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-amber-500 outline-none"
            />
            <input
              name="telegram"
              value={businessInfo.telegram}
              onChange={handleBusinessInfoChange}
              placeholder="تلگرام"
              className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-amber-500 outline-none"
            />
            <input
              name="whatsapp"
              value={businessInfo.whatsapp}
              onChange={handleBusinessInfoChange}
              placeholder="واتس‌اپ"
              className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        <ProductInputGroup title="قهوه (رُست شده)" categoryKey="coffee" />
        <ProductInputGroup title="دانه سبز" categoryKey="greenBean" />
        <ProductInputGroup title="پودریجات" categoryKey="powders" />

        <button
          onClick={handleReset}
          className="w-full text-center text-sm text-gray-500 hover:text-red-400 py-2 transition-colors"
        >
          پاک کردن تمام اطلاعات
        </button>
      </div>

      <div className="mt-8 lg:mt-0">
        <div className="sticky top-4">
          <h2 className="text-xl font-bold text-center text-amber-400 mb-4">پیش‌نمایش</h2>
          <div className="relative shadow-2xl rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
            {isGenerating && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <p className="text-amber-400 font-bold animate-pulse">در حال ساخت تصویر...</p>
              </div>
            )}
            <PriceListPreview
              businessInfo={businessInfo}
              products={products}
              innerRef={previewRef}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500"
            >
              <Download className="w-5 h-5" /> <span>دانلود</span>
            </button>
            <button
              onClick={handleShare}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500"
            >
              <Share2 className="w-5 h-5" /> <span>اشتراک‌گذاری</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};