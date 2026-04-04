import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface HistoryItem {
  dayOffset: number;
  averagePrice: number;
  totalSoldItems: number;
  totalCreditSum: number;
  totalOpenOffers: number;
}

interface PriceChartProps {
  history: HistoryItem[];
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

export default function PriceChart({ history }: PriceChartProps) {
  // Preparar dados para o gráfico
  const chartData = history
    .sort((a, b) => a.dayOffset - b.dayOffset)
    .map((item) => ({
      day: `Dia ${item.dayOffset}`,
      price: item.averagePrice,
      sold: item.totalSoldItems,
      offers: item.totalOpenOffers,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-lg border border-border/50" style={glassStyle}>
          <p className="text-sm font-semibold text-foreground">{payload[0].payload.day}</p>
          <p className="text-sm" style={gradientTextStyle}>
            Preço: {new Intl.NumberFormat('pt-BR').format(Math.round(payload[0].value))}
          </p>
          {payload[0].payload.sold && (
            <p className="text-sm text-muted-foreground">
              Vendidos: {payload[0].payload.sold}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Gráfico de Preço Médio */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Evolução do Preço Médio</h3>
        <div className="p-4 rounded-xl" style={glassStyle}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: '#ec4899', r: 5 }}
                activeDot={{ r: 7 }}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Itens Vendidos */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Itens Vendidos por Dia</h3>
        <div className="p-4 rounded-xl" style={glassStyle}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="sold"
                fill="url(#colorSold)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl text-center" style={glassStyle}>
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Preço Mínimo</p>
          <p className="text-xl font-bold" style={gradientTextStyle}>
            {new Intl.NumberFormat('pt-BR').format(
              Math.round(Math.min(...chartData.map(d => d.price)))
            )}
          </p>
        </div>
        <div className="p-4 rounded-xl text-center" style={glassStyle}>
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Preço Máximo</p>
          <p className="text-xl font-bold" style={gradientTextStyle}>
            {new Intl.NumberFormat('pt-BR').format(
              Math.round(Math.max(...chartData.map(d => d.price)))
            )}
          </p>
        </div>
        <div className="p-4 rounded-xl text-center" style={glassStyle}>
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Total Vendido</p>
          <p className="text-xl font-bold" style={gradientTextStyle}>
            {new Intl.NumberFormat('pt-BR').format(
              chartData.reduce((acc, d) => acc + d.sold, 0)
            )}
          </p>
        </div>
        <div className="p-4 rounded-xl text-center" style={glassStyle}>
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Média de Preço</p>
          <p className="text-xl font-bold" style={gradientTextStyle}>
            {new Intl.NumberFormat('pt-BR').format(
              Math.round(chartData.reduce((acc, d) => acc + d.price, 0) / chartData.length)
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
