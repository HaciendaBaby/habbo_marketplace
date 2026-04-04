import { Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

interface ItemStats {
  currentPrice: number;
  currentOpenOffers: number;
  soldItemCount: number;
  creditSum: number;
  averagePrice: number;
}

interface ItemData {
  name: string;
  classname: string;
  iconUrl: string;
  stats: ItemStats;
}

interface MarketplaceCardProps {
  itemData: ItemData;
}

const glassStyle = {
  background: 'rgba(30, 30, 80, 0.4)',
  border: '1px solid rgba(100, 100, 200, 0.3)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  backdropFilter: 'blur(10px)'
};

const gradientTextStyle = {
  background: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 50%, #3b82f6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
};

export default function MarketplaceCard({ itemData }: MarketplaceCardProps) {
  const { name, classname, iconUrl, stats } = itemData;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(num));
  };

  return (
    <div className="p-8 rounded-2xl" style={glassStyle}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Item Info */}
        <div className="flex flex-col items-center md:items-start">
          <div className="p-4 rounded-xl mb-4 w-24 h-24 flex items-center justify-center" style={glassStyle}>
            <img 
              src={iconUrl} 
              alt={name}
              className="w-20 h-20 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3C/svg%3E';
              }}
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{name}</h2>
          <p className="text-sm text-muted-foreground font-mono">{classname}</p>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {/* Current Price */}
          <div className="p-4 rounded-xl" style={glassStyle}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" style={gradientTextStyle} />
              <span className="text-xs font-semibold text-muted-foreground uppercase">Preço Atual</span>
            </div>
            <p className="text-2xl font-bold" style={gradientTextStyle}>
              {formatNumber(stats.currentPrice)}
            </p>
          </div>

          {/* Open Offers */}
          <div className="p-4 rounded-xl" style={glassStyle}>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4" style={gradientTextStyle} />
              <span className="text-xs font-semibold text-muted-foreground uppercase">Ofertas Abertas</span>
            </div>
            <p className="text-2xl font-bold" style={gradientTextStyle}>
              {formatNumber(stats.currentOpenOffers)}
            </p>
          </div>

          {/* Total Sold */}
          <div className="p-4 rounded-xl" style={glassStyle}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4" style={gradientTextStyle} />
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Vendido</span>
            </div>
            <p className="text-2xl font-bold" style={gradientTextStyle}>
              {formatNumber(stats.soldItemCount)}
            </p>
          </div>

          {/* Average Price */}
          <div className="p-4 rounded-xl" style={glassStyle}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={gradientTextStyle} />
              <span className="text-xs font-semibold text-muted-foreground uppercase">Preço Médio</span>
            </div>
            <p className="text-2xl font-bold" style={gradientTextStyle}>
              {formatNumber(stats.averagePrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 pt-8 border-t border-border/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total de Créditos</p>
            <p className="text-lg font-semibold text-foreground">
              {formatNumber(stats.creditSum)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Preço Mínimo</p>
            <p className="text-lg font-semibold text-foreground">
              {formatNumber(stats.currentPrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Preço Máximo</p>
            <p className="text-lg font-semibold text-foreground">
              {formatNumber(stats.currentPrice * 1.5)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
            <p className="text-lg font-semibold text-foreground">
              {stats.soldItemCount > 0 ? formatNumber(stats.creditSum / stats.soldItemCount) : '0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
