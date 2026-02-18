
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Product, Category, Language, AdminSettings, User as UserType } from './types';
import { TRANSLATIONS, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_USERS } from './constants';
import { generateTryOnImage } from './services/geminiService';

// Helper to convert URL to Base64 (needed for Virtual Try-On with initial products)
async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Icons Helper
const Icon = ({ name, className = "w-5 h-5" }: { name: string, className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    shopping: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    camera: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14M5 12h14"/></svg>,
    edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
    chevronRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>,
    menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
    whatsapp: <svg fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
    upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
  };
  return icons[name] || <span>?</span>;
};

// State Hooks for Persistance Simulation
const usePersistedState = <T,>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
};

// Main Layout Component
const Navbar = ({ lang, setLang }: { lang: Language, setLang: (l: Language) => void }) => {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-serif font-bold tracking-tight text-amber-800">RUTBA</span>
          <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-stone-500">Fashion World</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex bg-stone-100 rounded-full p-1 text-xs">
            {(['en', 'mr', 'hi'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full uppercase transition-all ${lang === l ? 'bg-amber-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link to="/admin" className="p-2 text-stone-500 hover:text-amber-800 transition-colors">
            <Icon name="user" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

// Home Page
const Home = ({ products, categories, lang }: { products: Product[], categories: Category[], lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const filteredProducts = selectedCat === 'all' ? products : products.filter(p => p.category === selectedCat);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-stone-900 text-white">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Hero" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-serif mb-4 leading-tight">{t.heroTitle}</h1>
          <p className="text-lg md:text-xl text-stone-200 max-w-2xl mx-auto mb-8 font-light tracking-wide">{t.heroSub}</p>
          <button className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-all transform hover:scale-105 shadow-xl">
            {t.shopNow}
          </button>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif text-center mb-10">{t.categories}</h2>
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-6 py-2 rounded-full border transition-all ${selectedCat === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
          >
            {t.allProducts}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-6 py-2 rounded-full border transition-all ${selectedCat === cat.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
            >
              {cat.name[lang]}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className="group">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-200 shadow-sm transition-transform duration-500 group-hover:-translate-y-2">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-amber-800 shadow-sm uppercase tracking-wider">
                  {product.category}
                </div>
              </div>
              <div className="mt-4 flex justify-between items-start px-1">
                <div>
                  <h3 className="text-lg font-medium text-stone-800 group-hover:text-amber-800 transition-colors">{product.name}</h3>
                  <p className="text-stone-500 text-sm mt-1">₹{product.price}</p>
                </div>
                <div className="bg-stone-100 p-2 rounded-full text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                  <Icon name="shopping" className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-stone-400 font-light italic">
            {t.noProducts}
          </div>
        )}
      </section>
    </div>
  );
};

// Product Detail Page
const ProductDetail = ({ products, adminSettings, lang }: { products: Product[], adminSettings: AdminSettings, lang: Language }) => {
  const { id } = useParams();
  const t = TRANSLATIONS[lang];
  const product = products.find(p => p.id === id);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!product) return <div className="p-10 text-center">Product not found</div>;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!userImage || !product) return;
    setIsProcessing(true);
    try {
      const userBase64 = userImage.split(',')[1];
      
      // Get Product Image Base64
      let productBase64 = "";
      if (product.image.startsWith('data:')) {
        productBase64 = product.image.split(',')[1];
      } else {
        // Fetch from URL if needed
        productBase64 = await urlToBase64(product.image);
      }
      
      const result = await generateTryOnImage(
        userBase64, 
        productBase64, 
        `${product.name} - ${product.description}`, 
        product.gender
      );
      setResultImage(result);
    } catch (err) {
      console.error(err);
      alert("AI processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const buyOnWhatsapp = () => {
    const message = encodeURIComponent(`${t.whatsappMsg} ${product.name}\nSize: ${selectedSize || 'Not selected'}\nLink: ${window.location.href}`);
    window.open(`https://wa.me/${adminSettings.whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl bg-stone-100">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col">
          <nav className="flex gap-2 text-stone-400 text-sm mb-6 uppercase tracking-widest font-medium">
            <Link to="/" className="hover:text-amber-800 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-amber-800">{product.category}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-stone-900">{product.name}</h1>
          <p className="text-2xl text-amber-800 font-semibold mb-6">₹{product.price}</p>
          
          <div className="bg-white p-6 rounded-2xl border border-stone-200 mb-8 shadow-sm">
            <h4 className="text-stone-400 uppercase tracking-widest text-xs font-bold mb-4">Description</h4>
            <p className="text-stone-600 leading-relaxed mb-6">{product.description}</p>
            
            <h4 className="text-stone-400 uppercase tracking-widest text-xs font-bold mb-4">{t.sizes}</h4>
            <div className="flex flex-wrap gap-2 mb-8">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] h-12 flex items-center justify-center rounded-xl border transition-all ${selectedSize === size ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={buyOnWhatsapp}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <Icon name="whatsapp" className="w-6 h-6" />
                {t.buyNow}
              </button>
              
              <button 
                onClick={() => setIsTryOnOpen(true)}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <Icon name="camera" className="w-6 h-6" />
                {t.tryItOn}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isTryOnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-stone-800">{t.tryItOn}</h2>
              <button onClick={() => setIsTryOnOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              {!resultImage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <p className="text-stone-500 font-light">Upload your photo to see exactly how this <span className="text-amber-800 font-semibold">{product.name}</span> looks on you.</p>
                    <div className="space-y-4">
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-stone-200 rounded-3xl hover:border-amber-500 hover:bg-stone-50 transition-all cursor-pointer overflow-hidden group">
                        {userImage ? (
                          <img src={userImage} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6">
                            <div className="p-4 bg-amber-50 rounded-full mb-4 text-amber-600 group-hover:scale-110 transition-transform">
                              <Icon name="camera" className="w-10 h-10" />
                            </div>
                            <p className="text-sm text-stone-600 font-medium">{t.uploadPhoto}</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                      <button 
                        disabled={!userImage || isProcessing}
                        onClick={handleTryOn}
                        className="w-full bg-amber-800 hover:bg-amber-700 disabled:bg-stone-300 text-white py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {t.processing}
                          </>
                        ) : (
                          <>🚀 Launch Virtual Model</>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <img src={product.image} className="w-full aspect-[3/4] object-cover rounded-3xl shadow-xl grayscale-[0.2]" />
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-fadeIn text-center">
                   <div className="relative aspect-[3/4] max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-800/20">
                    <img src={resultImage} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-center gap-4 mt-6">
                    <button 
                      onClick={() => {setResultImage(null); setUserImage(null);}}
                      className="px-8 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium transition-all"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={buyOnWhatsapp}
                      className="px-8 py-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] font-bold shadow-lg transition-all"
                    >
                      Love it! Buy Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Components
const AdminDashboard = ({ 
  products, setProducts, 
  categories, setCategories, 
  users, setUsers,
  settings, setSettings 
}: { 
  products: Product[], setProducts: (p: Product[]) => void,
  categories: Category[], setCategories: (c: Category[]) => void,
  users: UserType[], setUsers: (u: UserType[]) => void,
  settings: AdminSettings, setSettings: (s: AdminSettings) => void
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'users' | 'settings'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === settings.adminPassword) {
      setIsLoggedIn(true);
    } else {
      alert('Invalid Password');
    }
  };

  const updateProduct = (updated: Product) => {
    setProducts(products.map(p => p.id === updated.id ? updated : p));
    setEditingProduct(null);
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>, productSetter: (p: Product) => void, currentProduct: Product) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => productSetter({...currentProduct, image: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-stone-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-amber-800 mb-2">Admin Portal</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-amber-800 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-amber-700">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-stone-900 text-white p-6 flex flex-col gap-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center font-bold">R</div>
          <span className="font-serif text-xl">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-2">
          {(['products', 'categories', 'users', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all capitalize font-medium ${activeTab === tab ? 'bg-amber-800 text-white shadow-lg' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
            >
              <Icon name={tab === 'products' ? 'shopping' : tab === 'categories' ? 'menu' : tab === 'users' ? 'user' : 'settings' as any} />
              {tab}
            </button>
          ))}
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 px-4 py-3 mt-8 text-stone-500 hover:text-red-400">
            <Icon name="trash" /> Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif">Product Inventory</h2>
                <button 
                  onClick={() => {
                    setEditingProduct({
                      id: Date.now().toString(),
                      name: "New Product",
                      description: "",
                      price: 0,
                      category: categories[0]?.id || "men",
                      image: "https://via.placeholder.com/400x600",
                      sizes: ["S", "M", "L", "XL"],
                      gender: "man"
                    });
                  }}
                  className="bg-amber-800 text-white px-6 py-2 rounded-xl flex items-center gap-2"
                >
                  <Icon name="plus" /> Add Product
                </button>
              </div>
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-100 text-xs font-bold uppercase text-stone-400">
                    <tr>
                      <th className="px-6 py-4">Preview</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="px-6 py-4"><img src={p.image} className="w-12 h-16 object-cover rounded-lg" /></td>
                        <td className="px-6 py-4 font-medium">{p.name}</td>
                        <td className="px-6 py-4">₹{p.price}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-stone-100 rounded text-xs">{p.category}</span></td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => setEditingProduct(p)} className="text-amber-600 p-2"><Icon name="edit" className="w-4 h-4" /></button>
                          <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="text-red-400 p-2"><Icon name="trash" className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-serif">Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white p-4 rounded-3xl border border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={cat.image} className="w-16 h-16 rounded-2xl object-cover" />
                      <h4 className="font-bold">{cat.name.en}</h4>
                    </div>
                    <button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="text-red-300 hover:text-red-500 p-2"><Icon name="trash" className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif">User Management</h2>
                <button 
                  onClick={() => {
                    const username = prompt('Username:');
                    if (username) setUsers([...users, { id: Date.now().toString(), username, role: 'staff' }]);
                  }}
                  className="bg-amber-800 text-white px-6 py-2 rounded-xl flex items-center gap-2"
                >
                  <Icon name="plus" /> Add User
                </button>
              </div>
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-100 text-xs uppercase text-stone-400">
                    <tr>
                      <th className="px-6 py-4">Username</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-stone-50/50">
                        <td className="px-6 py-4 font-medium">{u.username}</td>
                        <td className="px-6 py-4 uppercase text-[10px] font-bold">{u.role}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setUsers(users.filter(item => item.id !== u.id))} className="text-red-400 p-2"><Icon name="trash" className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn max-w-2xl">
              <h2 className="text-3xl font-serif">Settings</h2>
              <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-2">WhatsApp Order Number</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Admin Password</label>
                  <input
                    type="text"
                    value={settings.adminPassword}
                    onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h2 className="text-2xl font-serif">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-stone-200 rounded-full">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Product Name</label>
                    <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Price (₹)</label>
                    <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Category</label>
                    <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Gender</label>
                    <select value={editingProduct.gender} onChange={e => setEditingProduct({...editingProduct, gender: e.target.value as 'man' | 'woman'})} className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none">
                      <option value="man">Man</option>
                      <option value="woman">Woman</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4 text-center">
                  <label className="block text-xs font-bold uppercase text-stone-400 mb-1 text-left">Product Image</label>
                  <div className="relative group mx-auto w-32 h-44 border-2 border-dashed border-stone-200 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500 transition-all">
                    <img src={editingProduct.image} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Icon name="upload" className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold">UPLOAD PHOTO</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProductImageUpload(e, setEditingProduct, editingProduct)} />
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-400 mb-1 text-left">Description</label>
                    <textarea rows={3} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-400 mb-1 text-left">Sizes</label>
                    <input type="text" value={editingProduct.sizes.join(', ')} onChange={e => setEditingProduct({...editingProduct, sizes: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl outline-none text-sm" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
              <button onClick={() => setEditingProduct(null)} className="px-6 py-2 rounded-xl border font-medium">Cancel</button>
              <button onClick={() => {
                if (products.find(p => p.id === editingProduct.id)) {
                  updateProduct(editingProduct);
                } else {
                  setProducts([...products, editingProduct]);
                  setEditingProduct(null);
                }
              }} className="px-8 py-2 rounded-xl bg-amber-800 text-white font-bold">Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [products, setProducts] = usePersistedState<Product[]>('rutba-products', INITIAL_PRODUCTS);
  const [categories, setCategories] = usePersistedState<Category[]>('rutba-categories', INITIAL_CATEGORIES);
  const [users, setUsers] = usePersistedState<UserType[]>('rutba-users', INITIAL_USERS);
  const [settings, setSettings] = usePersistedState<AdminSettings>('rutba-settings', {
    whatsappNumber: '911234567890',
    adminPassword: 'admin'
  });

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar lang={lang} setLang={setLang} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home products={products} categories={categories} lang={lang} />} />
            <Route path="/product/:id" element={<ProductDetail products={products} adminSettings={settings} lang={lang} />} />
            <Route path="/admin" element={<AdminDashboard products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} users={users} setUsers={setUsers} settings={settings} setSettings={setSettings} />} />
          </Routes>
        </div>
        <footer className="bg-stone-900 text-white py-12 px-4 border-t border-white/5 text-center">
          <h2 className="text-2xl font-serif font-bold text-amber-500">RUTBA</h2>
          <p className="text-stone-500 text-sm">{TRANSLATIONS[lang].footerText}</p>
        </footer>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </Router>
  );
}
