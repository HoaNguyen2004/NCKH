import { MessageSquare, ShoppingCart, Tag, Target } from 'lucide-react';

interface MetricsCardsProps {
  posts: any[];
}

export function MetricsCards({ posts }: MetricsCardsProps) {
  const totalPosts = posts.length;
  const buyingPosts = posts.filter(p => p.type === 'Buying').length;
  const sellingPosts = posts.filter(p => p.type === 'Selling').length;

  const metrics = [
    {
      label: 'Total Posts',
      value: totalPosts,
      change: '+12%',
      icon: MessageSquare,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Buying Posts',
      value: buyingPosts,
      change: '+8%',
      icon: ShoppingCart,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Selling Posts',
      value: sellingPosts,
      change: '+15%',
      icon: Tag,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Accuracy Rate',
      value: '94.2%',
      change: '+2%',
      icon: Target,
      bgColor: 'bg-pink-100',
      iconColor: 'text-pink-600'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="text-gray-500">{metric.label}</div>
              <div className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
            </div>
            <div className="text-gray-900 text-3xl mb-2">{metric.value}</div>
            <div className="flex items-center gap-1">
              <span className="text-green-600 text-sm">↗ {metric.change}</span>
              <span className="text-gray-500 text-sm">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
