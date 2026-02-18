
import { Language, Product, Category, User } from './types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    heroTitle: "Elegance in Every Stitch",
    heroSub: "Experience the next generation of fashion with Rutba",
    tryItOn: "Virtual Try-On",
    buyNow: "Buy Now",
    shopNow: "Shop Now",
    categories: "Categories",
    allProducts: "Our Collection",
    price: "Price",
    sizes: "Available Sizes",
    uploadPhoto: "Upload Photo",
    takePhoto: "Take Photo",
    processing: "Processing AI Try-On...",
    home: "Home",
    admin: "Admin",
    selectCategory: "Select Category",
    whatsappMsg: "Hi Rutba, I want to buy this product: ",
    noProducts: "No products found in this category.",
    footerText: "© 2024 Rutba Fashion World. All Rights Reserved."
  },
  mr: {
    heroTitle: "प्रत्येक विणकामात अभिजातता",
    heroSub: "रूतबा सोबत फॅशनच्या पुढच्या पिढीचा अनुभव घ्या",
    tryItOn: "ट्राय इट ऑन",
    buyNow: "आत्ता खरेदी करा",
    shopNow: "खरेदी करा",
    categories: "श्रेणी",
    allProducts: "आमचे कलेक्शन",
    price: "किंमत",
    sizes: "उपलब्ध आकार",
    uploadPhoto: "फोटो अपलोड करा",
    takePhoto: "फोटो काढा",
    processing: "AI प्रक्रिया सुरू आहे...",
    home: "होम",
    admin: "अ‍ॅडमिन",
    selectCategory: "श्रेणी निवडा",
    whatsappMsg: "नमस्कार रूतबा, मला हे उत्पादन खरेदी करायचे आहे: ",
    noProducts: "या श्रेणीमध्ये कोणतीही उत्पादने आढळली नाहीत.",
    footerText: "© २०२४ रूतबा फॅशन वर्ल्ड. सर्व हक्क राखीव."
  },
  hi: {
    heroTitle: "हर सिलाई में भव्यता",
    heroSub: "रुतबा के साथ फैशन की अगली पीढ़ी का अनुभव करें",
    tryItOn: "ट्राय इट ऑन",
    buyNow: "अभी खरीदें",
    shopNow: "शॉप करें",
    categories: "श्रेणियां",
    allProducts: "हमारा कलेक्शन",
    price: "कीमत",
    sizes: "उपलब्ध साइज़",
    uploadPhoto: "फोटो अपलोड करें",
    takePhoto: "फोटो खींचें",
    processing: "AI प्रोसेसिंग जारी है...",
    home: "होम",
    admin: "एडमिन",
    selectCategory: "श्रेणी चुनें",
    whatsappMsg: "नमस्ते रुतबा, मुझे यह उत्पाद खरीदना है: ",
    noProducts: "इस श्रेणी में कोई उत्पाद नहीं मिला।",
    footerText: "© 2024 रुतबा फैशन वर्ल्ड। सर्वाधिकार सुरक्षित।"
  }
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'men', name: { en: 'Men', mr: 'पुरुष', hi: 'पुरुष' }, image: 'https://picsum.photos/seed/men/400/600' },
  { id: 'women', name: { en: 'Women', mr: 'महिला', hi: 'महिला' }, image: 'https://picsum.photos/seed/women/400/600' },
  { id: 'ethnic', name: { en: 'Ethnic', mr: 'पारंपारिक', hi: 'पारंपरिक' }, image: 'https://picsum.photos/seed/ethnic/400/600' },
  { id: 'casual', name: { en: 'Casual', mr: 'कॅज्युअल', hi: 'कैजुअल' }, image: 'https://picsum.photos/seed/casual/400/600' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Royal Black Kurta',
    description: 'Premium cotton fabric with hand-embroidered neck detail.',
    price: 1899,
    category: 'ethnic',
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=800',
    sizes: ['M', 'L', 'XL'],
    gender: 'man'
  },
  {
    id: '2',
    name: 'Silk Banarasi Saree',
    description: 'Traditional silk saree with gold zari work.',
    price: 4500,
    category: 'ethnic',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    sizes: ['Free Size'],
    gender: 'woman'
  },
  {
    id: '3',
    name: 'Oversized Graphic Tee',
    description: 'Pure cotton oversized t-shirt with aesthetic print.',
    price: 899,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
    sizes: ['S', 'M', 'L', 'XL'],
    gender: 'man'
  }
];

export const INITIAL_USERS: User[] = [
  { id: 'admin-1', username: 'admin', role: 'admin' }
];
