import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, TrendingUp, Package } from 'lucide-react';
import MarketplaceCard from '@/components/MarketplaceCard';
import PriceChart from '@/components/PriceChart';
import FeaturedItems from '@/components/FeaturedItems';
import { toast } from 'sonner';

interface ItemStats {
  currentPrice: number;
  currentOpenOffers: number;
  soldItemCount: number;
  creditSum: number;
  averagePrice: number;
  history?: Array<{
    dayOffset: number;
    averagePrice: number;
    totalSoldItems: number;
    totalCreditSum: number;
    totalOpenOffers: number;
  }>;
}

interface ItemData {
  name: string;
  classname: string;
  iconUrl: string;
  stats: ItemStats;
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

export default function Home() {
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const TOKEN = "334|bytz3FTesCJWwDRHNlMFN9W19oChHLjBY4CaAvWme330754a";
  const HOTEL_ID = 2;

  const searchItem = async () => {
    const name = itemName.trim();
    
    if (!name) {
      toast.error('Por favor, insira o nome do item');
      return;
    }

    setLoading(true);
    setError(null);
    setItemData(null);

    try {
      // 1️⃣ Busca na API Habbofurni
      const furniRes = await fetch(
        `https://habbofurni.com/api/v1/furniture?search=${encodeURIComponent(name)}&per_page=1`,
        {
          headers: {
            "Authorization": "Bearer " + TOKEN,
            "X-Hotel-ID": String(HOTEL_ID),
            "Accept": "application/json"
          }
        }
      );

      if (!furniRes.ok) {
        throw new Error('Erro ao buscar item na Habbofurni');
      }

      const furniData = await furniRes.json();
      if (!furniData.data || !furniData.data.length) {
        setError('Item não encontrado na Habbofurni');
        toast.error('Item não encontrado');
        setLoading(false);
        return;
      }

      const furni = furniData.data[0];
      const classname = furni.classname;
      const iconUrl = furni.hotelData.icon.url;

      // 2️⃣ Busca stats na Feira Livre
      const statsRes = await fetch("https://www.habbo.com.br/api/public/marketplace/stats/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomItems: [{ item: classname }],
          wallItems: [{ item: classname }]
        })
      });

      if (!statsRes.ok) {
        throw new Error('Erro ao buscar dados do mercado');
      }

      const statsData = await statsRes.json();
      const items = [...(statsData.roomItemData || []), ...(statsData.wallItemData || [])];
      
      if (!items.length) {
        setError('Nenhum dado de mercado encontrado para este item');
        toast.error('Sem dados de mercado');
        setLoading(false);
        return;
      }

      const itemStats = items[0];

      setItemData({
        name: furni.hotelData.name,
        classname,
        iconUrl,
        stats: itemStats
      });

      toast.success('Item encontrado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchItem();
    }
  };

  return (
    <div className="min-h-screen w-full py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-10 h-10" style={gradientTextStyle} />
            <h1 className="text-4xl md:text-5xl font-bold" style={gradientTextStyle}>
              Habbo Marketplace
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Consulte preços e estatísticas de itens da Feira Livre do Habbo.com.br
          </p>
        </div>

        {/* Featured Items Section */}
        <FeaturedItems />

        {/* Search Section */}
        <div className="mb-12">
          <div className="p-6 rounded-2xl transition-all duration-300" style={glassStyle}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Digite o nome do item (ex: sofa, lamp, etc)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                disabled={loading}
              />
              <Button
                onClick={searchItem}
                disabled={loading}
                className="sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    <span>Buscar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {error && (
          <div className="p-6 rounded-2xl border-l-4 border-red-500 mb-8" style={glassStyle}>
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {itemData && (
          <div className="space-y-8">
            {/* Item Card */}
            <MarketplaceCard itemData={itemData} />

            {/* Chart Section */}
            {itemData.stats.history && itemData.stats.history.length > 0 && (
              <div className="p-6 rounded-2xl transition-all duration-300" style={glassStyle}>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5" style={gradientTextStyle} />
                  <h2 className="text-2xl font-bold text-foreground">
                    Histórico de Preços
                  </h2>
                </div>
                <PriceChart history={itemData.stats.history} />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!itemData && !error && !loading && (
          <div className="p-12 rounded-2xl text-center" style={glassStyle}>
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground">
              Comece a buscar um item para ver as estatísticas do mercado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
