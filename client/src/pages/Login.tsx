import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

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

export default function Login() {
  const [step, setStep] = useState<'username' | 'verify'>('username');
  const [username, setUsername] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, setLocation] = useLocation();

  const generateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Insira um nome de utilizador');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.habbo.com.br/api/public/users/${encodeURIComponent(username)}`
      );
      
      if (!response.ok) {
        toast.error('Utilizador não encontrado no Habbo');
        setLoading(false);
        return;
      }

      const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      setGeneratedCode(newCode);
      setStep('verify');
      toast.success('✅ Código gerado! Coloque-o na missão do Habbo');
    } catch (error) {
      toast.error('Erro ao verificar utilizador');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCodeInMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      toast.error('Insira o código da missão');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.habbo.com.br/api/public/users/${encodeURIComponent(username)}`
      );
      
      if (!response.ok) {
        toast.error('Utilizador não encontrado');
        setLoading(false);
        return;
      }
      
      const userData = await response.json();
      
      if (userData.motto && userData.motto.includes(verifyCode.trim())) {
        localStorage.setItem('habboUser', JSON.stringify({
          username: userData.name,
          uniqueId: userData.uniqueId,
          figureString: userData.figureString,
          motto: userData.motto,
          loginTime: new Date().toISOString()
        }));
        
        toast.success(`🎉 Bem-vindo, ${userData.name}!`);
        setLocation('/');
      } else {
        toast.error('❌ Código não encontrado na missão. Verifique se colocou corretamente!');
      }
    } catch (error) {
      toast.error('Erro ao verificar código');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Código copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen p-4" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2" style={gradientText}>
            Habbo Marketplace
          </h1>
          <p className="text-gray-400">Autentique-se com sua conta Habbo</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Login Form */}
          <div className="md:col-span-1">
            {step === 'username' ? (
              <div className="p-6 rounded-lg" style={glassStyle}>
                <h2 className="text-2xl font-bold text-white mb-6">🔐 Login</h2>
                <form onSubmit={generateCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Nome de Utilizador
                    </label>
                    <input
                      type="text"
                      placeholder="ex: whatwasit"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-transparent border border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !username.trim()}
                    style={{ background: gradientBg }}
                    className="w-full text-white font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Gerando...' : 'Gerar Código'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-6 rounded-lg" style={glassStyle}>
                <h2 className="text-2xl font-bold text-white mb-6">✅ Verificar</h2>
                <form onSubmit={verifyCodeInMission} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Código da Missão
                    </label>
                    <input
                      type="text"
                      placeholder="Cole o código"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-transparent border border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !verifyCode.trim()}
                    style={{ background: gradientBg }}
                    className="w-full text-white font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verificando...' : 'Verificar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('username');
                      setUsername('');
                      setVerifyCode('');
                      setGeneratedCode('');
                    }}
                    className="w-full text-gray-300 border border-gray-600 hover:bg-gray-900 py-2 rounded-lg"
                  >
                    Voltar
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Middle Column - Code Display */}
          {step === 'verify' && (
            <div className="md:col-span-1">
              <div className="p-6 rounded-lg" style={glassStyle}>
                <h2 className="text-2xl font-bold text-white mb-6">📋 Seu Código</h2>
                <div className="flex items-center justify-center p-6 rounded-lg mb-4" style={{
                  background: 'rgba(100, 100, 200, 0.2)',
                  border: '2px solid rgba(236, 72, 153, 0.5)'
                }}>
                  <code className="text-4xl font-bold tracking-widest" style={gradientText}>
                    {generatedCode}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="w-full px-4 py-2 rounded-lg transition-all"
                  style={{
                    background: copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 100, 200, 0.2)',
                    border: '1px solid rgba(100, 100, 200, 0.3)',
                    color: copied ? '#22c55e' : '#9ca3af'
                  }}
                >
                  {copied ? '✓ Copiado!' : '📋 Copiar Código'}
                </button>
              </div>
            </div>
          )}

          {/* Right Column - Instructions */}
          <div className="md:col-span-1">
            <div className="p-6 rounded-lg" style={glassStyle}>
              <h2 className="text-2xl font-bold text-white mb-6">📖 Como Funciona?</h2>
              <div className="space-y-3">
                {[
                  { num: 1, text: 'Insira seu nome de utilizador' },
                  { num: 2, text: 'Clique em "Gerar Código"' },
                  { num: 3, text: 'Copie o código gerado' },
                  { num: 4, text: 'Cole na sua missão no Habbo' },
                  { num: 5, text: 'Volte e verifique o código' }
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: gradientBg }}>
                      <span className="text-white font-bold text-sm">{step.num}</span>
                    </div>
                    <p className="text-gray-300 text-sm pt-1">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-8">
          Esta aplicação usa a API pública do Habbo.com.br • Dados armazenados apenas localmente
        </p>
      </div>
    </div>
  );
}
