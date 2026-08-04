import type { AdData } from "@/types";

export const feedAds: AdData[] = [
  {
    id: "ad-1", brand: "Nike", title: "Just Do It — Campus Edition",
    description: "Gear up for the semester with Nike's student exclusive collection.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=300&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=300&fit=crop",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=300&fit=crop",
    ],
    ctaText: "Shop Now", ctaLink: "#", commentsEnabled: true, discount: "20% off with college ID",
  },
  {
    id: "ad-2", brand: "Adidas", title: "Ultraboost for Students",
    description: "Run further, study harder. Adidas Ultraboost with exclusive campus colorways.",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=300&fit=crop",
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=300&fit=crop",
    ],
    ctaText: "Explore", ctaLink: "#", commentsEnabled: true, discount: "15% student discount",
  },
  {
    id: "ad-3", brand: "H&M", title: "Campus Style Guide 2025",
    description: "Fresh styles for the new semester. Sustainable fashion starting at ₹499.",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=300&fit=crop",
    ],
    ctaText: "Browse Collection", ctaLink: "#", commentsEnabled: false, discount: "Flat ₹200 off on ₹999+",
  },
  {
    id: "ad-4", brand: "Puma", title: "Puma x College Drops",
    description: "Limited edition sneakers designed for the campus lifestyle.",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=300&fit=crop",
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&h=300&fit=crop",
    ],
    ctaText: "Get Yours", ctaLink: "#", commentsEnabled: true,
  },
  {
    id: "ad-5", brand: "US Polo", title: "Dress Smart, Think Smart",
    description: "From interviews to presentations — look sharp with US Polo's student collection.",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=300&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=300&fit=crop",
    ],
    ctaText: "Shop Smart", ctaLink: "#", commentsEnabled: true, discount: "Buy 2 Get 1 Free",
  },
];

export const exploreAds: AdData[] = [
  { id: "ad-e1", brand: "Rado", title: "Time for Excellence", description: "Rado True Thinline — Swiss precision for the ambitious campus achiever.", images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=300&fit=crop", "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=300&fit=crop"], ctaText: "Discover", ctaLink: "#", commentsEnabled: true, discount: "15% off for toppers" },
  { id: "ad-e2", brand: "Nike", title: "Move. Study. Repeat.", description: "Nike Air Max for students. Built for those who never stop.", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=300&fit=crop", "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=300&fit=crop"], ctaText: "Shop Now", ctaLink: "#", commentsEnabled: true, discount: "20% student discount" },
  { id: "ad-e3", brand: "H&M", title: "Sustainable Campus Looks", description: "Eco-conscious fashion for the modern student. New arrivals starting ₹599.", images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=300&fit=crop"], ctaText: "Explore", ctaLink: "#", commentsEnabled: false },
];
