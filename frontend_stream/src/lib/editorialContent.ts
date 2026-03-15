export interface EditorialPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
  };
  publishedAt: string;
  readTime: string;
  category: string;
  image: string;
  views: number;
  featured?: boolean;
  tags: string[];
}

export const editorialPosts: EditorialPost[] = [
  {
    id: '1',
    title: "L'avenir de l'apprentissage en ligne : tendances a surveiller",
    excerpt:
      "Explorez comment l'IA, l'accompagnement synchrone et les experiences immersives transforment la maniere d'apprendre.",
    content:
      "L'apprentissage en ligne entre dans une nouvelle phase. Les plateformes les plus utiles ne se contentent plus d'heberger du contenu : elles orchestrent des parcours, des lives, de la personnalisation et de vrais points de contact avec les mentors.\n\nChez Stream Educatif, cela veut dire des parcours plus lisibles, des sessions live connectees au cours et une experience qui reste claire sur mobile comme sur desktop.\n\nLes prochaines evolutions les plus fortes sont la recommandation assistee par l'IA, le coaching contextuel, les formats courts a forte valeur et des interfaces capables de montrer la progression sans friction.",
    author: { name: 'David Chen', role: 'Lead Learning Designer' },
    publishedAt: '2024-10-12',
    readTime: '12 min',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=900&fit=crop',
    views: 4812,
    featured: true,
    tags: ['IA', 'EdTech', 'Live learning'],
  },
  {
    id: '2',
    title: 'Masteriser les fondamentaux de la data science',
    excerpt:
      "Pourquoi statistiques, logique et lecture des donnees restent les briques les plus solides avant le machine learning.",
    content:
      "Avant les frameworks et les modeles, il y a les fondamentaux. Une comprehension claire des probabilites, des distributions et des biais d'echantillonnage reste ce qui distingue une pratique solide d'une simple execution technique.",
    author: { name: 'Sarah Martinez', role: 'Data Mentor' },
    publishedAt: '2024-10-08',
    readTime: '8 min',
    category: 'Science',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=900&fit=crop',
    views: 3120,
    tags: ['Data', 'Science', 'ML'],
  },
  {
    id: '3',
    title: 'Python pour debuter sans se disperser',
    excerpt:
      "Une feuille de route simple pour apprendre Python, pratiquer vite et construire vos premiers automatismes.",
    content:
      "Commencer Python devient beaucoup plus simple quand on reduit le bruit. Variables, conditions, fonctions, structures de donnees et mini-projets suffisent pour entrer dans une vraie dynamique.",
    author: { name: 'Marc Dubois', role: 'Developer Educator' },
    publishedAt: '2024-10-05',
    readTime: '15 min',
    category: 'Development',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=900&fit=crop',
    views: 2788,
    tags: ['Python', 'Beginner', 'Code'],
  },
  {
    id: '4',
    title: 'Human-centered design : les principes qui changent tout',
    excerpt:
      "De l'empathie utilisateur au prototypage, ce sont souvent les decisions invisibles qui rendent un produit memorable.",
    content:
      "Un bon design ne crie pas, il guide. Les equipes les plus efficaces prennent le temps d'observer les usages reels, de simplifier les parcours et d'iterer avec methode.",
    author: { name: 'Maya Rodriguez', role: 'Product Designer' },
    publishedAt: '2024-10-03',
    readTime: '6 min',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=900&fit=crop',
    views: 2510,
    tags: ['UX', 'Design', 'Research'],
  },
  {
    id: '5',
    title: 'Remote learning survival kit',
    excerpt:
      "Comment garder de l'energie, du rythme et de la clarte quand on apprend a distance sur plusieurs semaines.",
    content:
      "Le vrai enjeu du remote learning n'est pas seulement l'acces au contenu. C'est la capacite a construire un rythme, un environnement et des points de controle qui evitent la fatigue decisionnelle.",
    author: { name: 'Julie Martin', role: 'Learning Coach' },
    publishedAt: '2024-09-28',
    readTime: '10 min',
    category: 'Productivity',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=900&fit=crop',
    views: 1984,
    tags: ['Focus', 'Routine', 'Learning'],
  },
  {
    id: '6',
    title: "L'impact economique de l'EdTech en 2024",
    excerpt:
      "Panorama des modeles, des usages et des arbitrages qui dessinent le prochain cycle de croissance du secteur.",
    content:
      "Le marche EdTech ne grossit pas uniquement par l'offre. Il mature aussi par l'exigence des utilisateurs : meilleure pedagogie, outils plus simples et mesure d'impact plus concrete.",
    author: { name: 'Emma Chen', role: 'EdTech Analyst' },
    publishedAt: '2024-09-24',
    readTime: '9 min',
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=900&fit=crop',
    views: 3421,
    tags: ['Business', 'EdTech', 'Market'],
  },
];

export function getEditorialCategories(posts: EditorialPost[] = editorialPosts) {
  const counts = posts.reduce<Record<string, number>>((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {});

  return [
    { id: 'all', label: 'Toutes les categories', count: posts.length },
    ...Object.entries(counts).map(([label, count]) => ({ id: label, label, count })),
  ];
}

export function getFeaturedEditorialPost(posts: EditorialPost[] = editorialPosts) {
  return posts.find((post) => post.featured) || posts[0];
}

export function getPopularEditorialPosts(limit = 3, posts: EditorialPost[] = editorialPosts) {
  return [...posts].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function formatEditorialDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function getEditorialCategoryTone(category: string) {
  const key = category.toLowerCase();
  if (key.includes('technology')) return 'bg-[#1152d4]';
  if (key.includes('science')) return 'bg-emerald-500';
  if (key.includes('development')) return 'bg-indigo-500';
  if (key.includes('design')) return 'bg-fuchsia-500';
  if (key.includes('product')) return 'bg-amber-500';
  return 'bg-slate-700';
}
