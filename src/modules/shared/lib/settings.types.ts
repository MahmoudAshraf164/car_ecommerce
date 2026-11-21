export interface ShowroomInfo {
  name: string;
  nameEn: string;
  currency: string;
  address: string;
  addressEn: string;
  email: string;
  facebook: string;
  tiktok: string;
  mapsGoogle: string;
  mapsBing: string;
}

export interface AdditionalContactNumber {
  id: string;
  label: string;
  phone: string;
  isWhatsapp: boolean;
}

export interface ContactNumbersSettings {
  primaryPhone: string;
  whatsappNumber: string;
  additionalNumbers: AdditionalContactNumber[];
}

export interface HeroSettings {
  bannerUrl: string;
  title?: string;
  subtitle?: string;
}

export const DEFAULT_SHOWROOM_INFO: ShowroomInfo = {
  name: "معرض ولاد العم للسيارات وأفلام الحماية",
  nameEn: "Welad El 3am Motors & PPF",
  currency: "EGP",
  address: "منوف، سكة سرس، بجوار شركة الدخان، المنوفية",
  addressEn: "Minuf, Seka Sers, Near Al-Dokhan Co., Menufia, Egypt",
  email: "weladelam40@gmail.com",
  facebook: "https://www.facebook.com/profile.php?id=100064037820487",
  tiktok: "https://tiktok.com/@..welad.el3am",
  mapsGoogle: "https://maps.app.goo.gl/HdCTJzJBapembYXm8",
  mapsBing:
    "https://www.bing.com/maps/default.aspx?v=2&pc=FACEBK&mid=8100&where1=30.456558107138%2C%2030.943344",
};

export const DEFAULT_CONTACT_NUMBERS: ContactNumbersSettings = {
  primaryPhone: "01007946824",
  whatsappNumber: "201007946824",
  additionalNumbers: [],
};

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  bannerUrl: "/welad-el3am-hero.png",
  title: "معرض ولاد العم للسيارات وأفلام الحماية",
  subtitle:
    "أجيال من الثقة والالتزام — وجهتك الأولى للسيارات المتميزة وباقات PPF والنانو سيراميك في منوف، المنوفية.",
};

export interface PublicCompanySettings {
  showroom: ShowroomInfo;
  contacts: ContactNumbersSettings;
  hero: HeroSettings;
}
