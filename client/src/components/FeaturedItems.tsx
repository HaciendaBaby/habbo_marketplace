import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FeaturedItem {
  name: string;
  classname: string;
  iconUrl: string;
  currentPrice: number;
  priceVariation: number;
  soldCount: number;
  openOffers: number;
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

// Lista de itens populares do Habbo para demonstração
const POPULAR_ITEMS = [
  'sofa',
  'lamp',
  'chair',
  'bed',
  'table',
  'carpet',
  'wall',
  'door',
  'window',
  'plant'
];

export default function FeaturedItems() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const TOKEN = "334|bytz3FTesCJWwDRHNlMFN9W19oChHLjBY4CaAvWme330754a";
  const HOTEL_ID = 2;

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      setLoading(true);
      try {
        const featuredItems: FeaturedItem[] = [];

        // Buscar dados de alguns itens populares
        for (const itemName of POPULAR_ITEMS.slice(0, 5)) {
          try {
            // Busca na API Habbofurni
            const furniRes = await fetch(
              `https://habbofurni.com/api/v1/furniture?search=${encodeURIComponent(itemName)}&per_page=1`,
              {
                headers: {
                  "Authorization": "Bearer " + TOKEN,
                  "X-Hotel-ID": String(HOTEL_ID),
                  "Accept": "application/json"
                }
              }
            );

            if (!furniRes.ok) continue;

            const furniData = await furniRes.json();
            if (!furniData.data || !furniData.data.length) continue;

            const furni = furniData.data[0];
            const classname = furni.classname;
            const iconUrl = furni.hotelData.icon.url;

            // Busca stats na Feira Livre
            const statsRes = await fetch("https://www.habbo.com.br/api/public/marketplace/stats/batch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                roomItems: [{ item: classname }],
                wallItems: [{ item: classname }]
              })
            });

            if (!statsRes.ok) continue;

            const statsData = await statsRes.json();
            const items = [...(statsData.roomItemData || []), ...(statsData.wallItemData || [])];
            
            if (!items.length) continue;

            const itemStats = items[0];

            // Calcular variação de preço baseado no histórico
            let priceVariation = 0;
            if (itemStats.history && itemStats.history.length > 1) {
              const oldPrice = itemStats.history[itemStats.history.length - 1].averagePrice;
              const newPrice = itemStats.history[0].averagePrice;
              priceVariation = ((newPrice - oldPrice) / oldPrice) * 100;
            }

            featuredItems.push({
              name: furni.hotelData.name,
              classname,
              iconUrl,
              currentPrice: itemStats.currentPrice,
              priceVariation,
              soldCount: itemStats.soldItemCount,
              openOffers: itemStats.currentOpenOffers
            });

            // Pequeno delay para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (err) {
            console.error(`Erro ao buscar ${itemName}:`, err);
            continue;
          }
        }

        // Ordenar por variação de preço (maior primeiro)
        featuredItems.sort((a, b) => Math.abs(b.priceVariation) - Math.abs(a.priceVariation));

        setItems(featuredItems);
      } catch (err) {
        console.error('Erro ao buscar itens em destaque:', err);
        toast.error('Erro ao carregar itens em destaque');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  if (loading) {
    return (
      <div className="p-8 rounded-2xl text-center" style={glassStyle}>
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gradient mb-3" />
        <p className="text-muted-foreground">Carregando itens em destaque...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-6 h-6" style={gradientTextStyle} />
        <h2 className="text-3xl font-bold" style={gradientTextStyle}>
          Itens em Destaque
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {items.map((item, index) => (
          <div
            key={item.classname}
            className="p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
            style={glassStyle}
          >
            {/* Badge de posição */}
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 50%, #3b82f6 100%)',
              color: 'white'
            }}>
              #{index + 1}
            </div>

            {/* Ícone do item */}
            <div className="w-full h-24 flex items-center justify-center mb-3 rounded-lg" style={{
              background: 'rgba(20, 20, 60, 0.5)',
              border: '1px solid rgba(100, 100, 200, 0.2)'
            }}>
              <img
                src={item.iconUrl}
                alt={item.name}
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Nome do item */}
            <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">
              {item.name}
            </h3>

            {/* Preço */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Preço Atual</p>
              <p className="text-lg font-bold" style={gradientTextStyle}>
                {new Intl.NumberFormat('pt-BR').format(Math.round(item.currentPrice))}
              </p>
            </div>

            {/* Variação de preço */}
            <div className="flex items-center gap-1 mb-3 p-2 rounded-lg" style={{
              background: item.priceVariation > 0 
                ? 'rgba(34, 197, 94, 0.1)' 
                : item.priceVariation < 0
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(100, 100, 200, 0.1)'
            }}>
              <TrendingUp className="w-3 h-3" style={{
                color: item.priceVariation > 0 ? '#22c55e' : item.priceVariation < 0 ? '#ef4444' : '#7c3aed'
              }} />
              <span className="text-xs font-semibold" style={{
                color: item.priceVariation > 0 ? '#22c55e' : item.priceVariation < 0 ? '#ef4444' : '#7c3aed'
              }}>
                {item.priceVariation > 0 ? '+' : ''}{item.priceVariation.toFixed(1)}%
              </span>
            </div>

            {/* Estatísticas */}
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Vendidos: <span className="text-foreground font-semibold">{new Intl.NumberFormat('pt-BR').format(item.soldCount)}</span></p>
              <p>Ofertas: <span className="text-foreground font-semibold">{new Intl.NumberFormat('pt-BR').format(item.openOffers)}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
