import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const glassStyle = {
  background: 'rgba(30, 30, 80, 0.3)',
  border: '1px solid rgba(100, 100, 200, 0.2)',
  backdropFilter: 'blur(10px)'
};

const gradientBg = 'linear-gradient(135deg, #ec4899 0%, #7c3aed 50%, #3b82f6 100%)';
const gradientText = {
  background: gradientBg,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemData, setItemData] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('habboUser');
    if (!userData) {
      setLocation('/login');
    } else {
      setUser(JSON.parse(userData));
      loadSearchHistory();
    }
  }, [setLocation]);

  const loadSearchHistory = () => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      const parsed = JSON.parse(history);
      setSearchHistory(parsed);
      updateFeaturedItems(parsed);
    }
  };

  const updateFeaturedItems = (history: any[]) => {
    // Agrupar por item e contar buscas
    const grouped = history.reduce((acc, item) => {
      const existing = acc.find((i: any) => i.name === item.name);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ ...item, count: 1 });
      }
      return acc;
    }, []);

    // Ordenar por contagem e pegar os 5 primeiros
    const top5 = grouped.sort((a: any, b: any) => b.count - a.count).slice(0, 5);
    setFeaturedItems(top5);
  };

  const searchItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Buscar item na API
      const response = await fetch(
        `https://api.habbo.com.br/api/public/items/${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        toast.error('Item não encontrado');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Item encontrado:', data);

      // Registar no histórico de buscas
      const newSearch = {
        name: data.name,
        id: data.id,
        timestamp: new Date().toISOString()
      };

      const history = localStorage.getItem('searchHistory');
      const parsed = history ? JSON.parse(history) : [];
      parsed.push(newSearch);
      console.log('Salvando no localStorage:', parsed);
      localStorage.setItem('searchHistory', JSON.stringify(parsed));
      setSearchHistory(parsed);
      updateFeaturedItems(parsed);
      console.log('Featured items atualizado');


      // Gerar dados de exemplo para gráficos
      setItemData(data);
      setPriceHistory([
        { date: 'Dia -2', price: Math.floor(Math.random() * 100) + 10, volume: Math.floor(Math.random() * 150) + 20 },
        { date: 'Dia -1', price: Math.floor(Math.random() * 100) + 10, volume: Math.floor(Math.random() * 150) + 20 }
      ]);

      toast.success('✅ Item encontrado!');
    } catch (error) {
      toast.error('Erro ao buscar item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('habboUser');
    setLocation('/login');
    toast.success('Desconectado com sucesso');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2" style={gradientText}>
              Habbo Marketplace
            </h1>
            <p className="text-gray-400">Bem-vindo, <span className="font-semibold text-white">{user.username}</span>!</p>
          </div>
          <button onClick={logout} className="text-white border border-gray-600 hover:bg-red-900/20 px-4 py-2 rounded-lg">
            🚪 Sair
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={searchItem} className="mb-8">
          <div className="p-4 rounded-lg flex gap-2" style={glassStyle}>
            <input
              type="text"
              placeholder="Pesquise um item do Habbo (ex: sofa, lamp, chair)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              className="border-0 bg-transparent text-white placeholder:text-gray-500 flex-1 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              style={{ background: gradientBg }}
              className="text-white px-6 rounded-lg disabled:opacity-50"
            >
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
        </form>

        {/* Featured Items Section */}
        {featuredItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">🔥 Itens Mais Pesquisados</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {featuredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg cursor-pointer transition-transform hover:scale-105"
                  style={{
                    ...glassStyle,
                    background: `linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)`
                  }}
                  onClick={() => {
                    setSearchTerm(item.name);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 px-2 py-1 rounded">
                      #{idx + 1}
                    </span>
                    <span className="text-xs">⏰</span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Buscas: {item.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {itemData && (
          <div className="space-y-6">
            {/* Item Info */}
            <div className="p-6 rounded-lg" style={glassStyle}>
              <h2 className="text-3xl font-bold text-white mb-6">{itemData.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(100, 100, 200, 0.1)',
                  border: '1px solid rgba(100, 100, 200, 0.3)'
                }}>
                  <p className="text-gray-400 text-sm mb-1">Preço Atual</p>
                  <p className="text-2xl font-bold text-white">{itemData.price || '—'}</p>
                </div>
                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(100, 100, 200, 0.1)',
                  border: '1px solid rgba(100, 100, 200, 0.3)'
                }}>
                  <p className="text-gray-400 text-sm mb-1">Ofertas Abertas</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(100, 100, 200, 0.1)',
                  border: '1px solid rgba(100, 100, 200, 0.3)'
                }}>
                  <p className="text-gray-400 text-sm mb-1">Total Vendido</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(100, 100, 200, 0.1)',
                  border: '1px solid rgba(100, 100, 200, 0.3)'
                }}>
                  <p className="text-gray-400 text-sm mb-1">Preço Médio</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            {priceHistory.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Chart */}
                <div className="p-6 rounded-lg" style={glassStyle}>
                  <h3 className="text-lg font-bold text-white mb-4">📈 Evolução de Preço</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,200,0.2)" />
                      <XAxis dataKey="date" stroke="rgba(100,100,200,0.5)" />
                      <YAxis stroke="rgba(100,100,200,0.5)" />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(30,30,80,0.9)', 
                          border: '1px solid rgba(100,100,200,0.5)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line type="monotone" dataKey="price" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Volume Chart */}
                <div className="p-6 rounded-lg" style={glassStyle}>
                  <h3 className="text-lg font-bold text-white mb-4">🛒 Itens Vendidos por Dia</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,200,0.2)" />
                      <XAxis dataKey="date" stroke="rgba(100,100,200,0.5)" />
                      <YAxis stroke="rgba(100,100,200,0.5)" />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(30,30,80,0.9)', 
                          border: '1px solid rgba(100,100,200,0.5)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="volume" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!itemData && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">🛍️ Pesquise um item para ver os detalhes do mercado</p>
          </div>
        )}
      </div>
    </div>
  );
}
