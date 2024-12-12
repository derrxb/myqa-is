import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import prisma from '~/infrastructure/database/index.server';
import { Card, CardContent } from '~/ui/atoms/card';
import { Link } from '@remix-run/react';
import { ChevronRight, Coins, Key, Lock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/ui/atoms/button';
import { MainLayout } from '~/ui/layouts/main';
import { useTypedLoaderData } from 'remix-typedjson';
import { getPrettyNumber } from '~/lib/currency';

const exampleCreators = [
  {
    username: 'alex',
    bio: 'Tech visionary and startup mentor',
    UserProfile: {
      Avatar: {
        url: '/placeholder.svg?text=AC',
      },
    },
  },
  {
    username: 'jamie',
    bio: 'Bestselling author and storyteller',
    UserProfile: {
      Avatar: {
        url: '/placeholder.svg?text=JL',
      },
    },
  },
  {
    username: 'sam',
    bio: 'Award-winning filmmaker',
    UserProfile: {
      Avatar: {
        url: '/placeholder.svg?text=SR',
      },
    },
  },
];

const exampleQuestions = [
  { question: 'What inspired your latest project?' },
  { question: 'How do you overcome creative blocks?' },
  { question: "What's your daily routine like?" },
  { question: 'Which books have influenced you the most?' },
  { question: 'What advice would you give to aspiring creators?' },
  { question: 'How do you see your field evolving in the next decade?' },
];

export const meta: MetaFunction = () => {
  return [
    {
      title: "MyQA.is | Your Fan's Preferred Way to Get to Know You",
    },
    {
      name: 'description',
      content:
        'Discover the stories behind your favorite creators on MyQA.is. Unlock deep, personal questions by supporting creators you love',
    },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  const [questions, creators] = await Promise.all([
    prisma.qA.findMany({ take: 5 }),
    prisma.user.findMany({ take: 5, include: { UserProfile: true } }),
  ]);
  return {
    questions: exampleQuestions,
    creators: exampleCreators,
  };
};

const Stats = {
  totalQuestions: 1205,
  totalKeys: 5840,
  totalVolume: 458_200,
  activeUsers: 842,
};

const LandingPage = () => {
  const data = useTypedLoaderData<typeof loader>();
  const [stats, setStats] = useState(Stats);

  useEffect(() => {
    setStats(Stats);
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black text-white mb-6">
            Unlock Exclusive Access to Your{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
              Favorite Creators
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Get unique insights and behind-the-scenes content from top creators.
            Own and trade access keys to premium Q&As, while creators earn BONK
            tokens from their expertise.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="font-medium" size="lg">
              <Link to="/login" className="flex items-center">
                Launch App
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="font-medium">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: Lock,
              title: 'Exclusive Q&As',
              value: stats.totalQuestions,
            },
            { icon: Key, title: 'Keys Traded', value: stats.totalKeys },
            { icon: Coins, title: 'BONK Traded', value: stats.totalVolume },
            { icon: Users, title: 'Active Creators', value: stats.activeUsers },
          ].map(({ icon: Icon, title, value }) => (
            <Card key={title}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-lg">
                    <Icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {getPrettyNumber(Number(value))}
                    </p>
                    <p className="text-slate-400">{title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-700/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">MyQA.is</h3>
              <p className="text-slate-400 text-sm">
                The premier marketplace for creator Q&As and exclusive content
                access on Solana.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    All Q&As
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Top Creators
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Featured Keys
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Popular Topics
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Creator Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Newsletter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              ©️ 2024 MyQA.is. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white text-sm">
                Twitter
              </a>
              <a href="#" className="text-slate-400 hover:text-white text-sm">
                Discord
              </a>
              <a href="#" className="text-slate-400 hover:text-white text-sm">
                Telegram
              </a>
              <a href="#" className="text-slate-400 hover:text-white text-sm">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </MainLayout>
  );
};

const LandingPageWithMeta = () => {
  useEffect(() => {
    document.title = 'MyQA | Connect with Creators Through Exclusive Q&As';

    const metaTags = [
      {
        name: 'description',
        content:
          'Get exclusive access to your favorite creators through tradeable NFT keys. Unlock premium Q&As and behind-the-scenes content on Solana.',
      },
      {
        property: 'og:title',
        content: 'KnowledgeKey - Premium Creator Access Platform',
      },
      {
        property: 'og:description',
        content:
          'Own unique access to creator insights. Buy, sell, and trade content keys in the marketplace.',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'KnowledgeKey | Creator Access Keys' },
      {
        name: 'twitter:description',
        content:
          'Get VIP access to your favorite creators. Own and trade content keys on Solana.',
      },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.name = name;
      if (property) meta.setAttribute('property', property);
      meta.content = content;
      document.head.appendChild(meta);
    });

    return () => {
      metaTags.forEach(({ name, property }) => {
        const selector = name
          ? `meta[name="${name}"]`
          : `meta[property="${property}"]`;
        const meta = document.querySelector(selector);
        if (meta) meta.remove();
      });
    };
  }, []);

  return <LandingPage />;
};

export default LandingPageWithMeta;
