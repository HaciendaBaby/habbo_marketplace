import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { LogIn, CheckCircle2, Copy } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [username, setUsername] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
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
    toast.success('Código copiado!');
  };

  return (
    <div className="min-h-screen w-full flex flex-col" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      {/* Header */}
      <div className="w-full py-6 px-4 border-b border-gray-700/50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold" style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Habbo Marketplace
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {step === 'input' ? (
            // Step 1: Username Input
            <div className="p-8 rounded-2xl" style={{
              background: 'rgba(30, 30, 80, 0.4)',
              border: '1px solid rgba(100, 100, 200, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <LogIn className="text-blue-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Autenticar</h2>
              </div>

              <form onSubmit={generateCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome de Utilizador Habbo
                  </label>
                  <input
                    type="text"
                    placeholder="ex: whatwasit"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-all uppercase tracking-wide shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Processando...' : 'Gerar Código'}
                </button>
              </form>

              <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-gray-300">
                  <strong className="text-blue-400">Como funciona:</strong> Insira seu nome de utilizador e clique em "Gerar Código". Você receberá um código para colocar na sua missão do Habbo.
                </p>
              </div>
            </div>
          ) : (
            // Step 2: Code Verification
            <div className="p-8 rounded-2xl" style={{
              background: 'rgba(30, 30, 80, 0.4)',
              border: '1px solid rgba(100, 100, 200, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="text-green-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Verificar Código</h2>
              </div>

              <div className="space-y-6">
                {/* Generated Code Display */}
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Seu Código de Verificação:</p>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
                    <code className="text-3xl font-bold text-yellow-400 flex-1 tracking-widest">
                      {generatedCode}
                    </code>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="p-2 hover:bg-yellow-500/30 rounded-lg transition-colors"
                    >
                      <Copy size={20} className="text-yellow-400" />
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm font-medium text-blue-300 mb-2">Próximos passos:</p>
                  <ol className="text-sm text-gray-300 space-y-1">
                    <li>1. Copie o código acima</li>
                    <li>2. Abra o Habbo e vá à sua missão</li>
                    <li>3. Cole o código na missão</li>
                    <li>4. Volte aqui e cole o código abaixo</li>
                  </ol>
                </div>

                {/* Verification Form */}
                <form onSubmit={verifyCodeInMission} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código da Missão
                    </label>
                    <input
                      type="text"
                      placeholder="Cole o código que colocou na missão"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 rounded border-gray-600 bg-gray-900/50 cursor-pointer accent-blue-500"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-300 cursor-pointer">
                      Manter-me conectado
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('input');
                        setUsername('');
                        setVerifyCode('');
                        setGeneratedCode('');
                      }}
                      className="px-4 py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 text-white rounded-lg transition-all font-semibold"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !verifyCode.trim()}
                      className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold uppercase tracking-wide"
                    >
                      {loading ? 'Verificando...' : 'Verificar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
