import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { X, Copy, Check } from 'lucide-react';

const glassStyle = {
  background: 'rgba(20, 20, 60, 0.8)',
  border: '1px solid rgba(100, 100, 200, 0.3)',
  backdropFilter: 'blur(10px)'
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
    toast.success('Código copiado!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      <div className="w-full max-w-md">
        {/* Step 1: Login Card */}
        {step === 'username' && (
          <div className="p-8 rounded-2xl relative" style={glassStyle}>
            <button
              onClick={() => {
                setStep('username');
                setUsername('');
                setVerifyCode('');
                setGeneratedCode('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-2">Entrar com Habbo</h2>
            <p className="text-gray-400 text-sm mb-8">Verifique sua identidade pelo seu perfil do Habbo.</p>

            <form onSubmit={generateCode} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Seu nickname do Habbo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-all uppercase tracking-wide"
              >
                {loading ? 'Gerando código...' : 'Gerar Código de Verificação'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Verification Card */}
        {step === 'verify' && (
          <div className="p-8 rounded-2xl relative" style={glassStyle}>
            <button
              onClick={() => {
                setStep('username');
                setUsername('');
                setVerifyCode('');
                setGeneratedCode('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-2">Entrar com Habbo</h2>
            <p className="text-gray-400 text-sm mb-8">Verifique sua identidade pelo seu perfil do Habbo.</p>

            <div className="space-y-6">
              {/* Code Display */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Código de Verificação</p>
                <div className="flex items-center gap-3 p-4 rounded-lg" style={{
                  background: 'rgba(100, 100, 200, 0.1)',
                  border: '1px solid rgba(100, 100, 200, 0.3)'
                }}>
                  <code className="text-3xl font-bold text-yellow-400 flex-1 tracking-widest">
                    {generatedCode}
                  </code>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-lg" style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <ol className="text-sm text-gray-300 space-y-2">
                  <li><strong className="text-yellow-400">1.</strong> Copie o código acima</li>
                  <li><strong className="text-yellow-400">2.</strong> Vá ao Habbo e coloque na sua <strong className="text-yellow-400">missão</strong></li>
                  <li><strong className="text-yellow-400">3.</strong> Volte aqui e clique em verificar</li>
                </ol>
              </div>

              {/* Verify Form */}
              <form onSubmit={verifyCodeInMission} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Cole o código da missão"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-gray-600 bg-transparent cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-300 cursor-pointer">
                    Continuar conectado
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('username');
                      setUsername('');
                      setVerifyCode('');
                      setGeneratedCode('');
                    }}
                    className="px-4 py-3 bg-transparent border border-gray-600 text-white rounded-lg hover:bg-gray-900/30 transition-all font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !verifyCode.trim()}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold uppercase tracking-wide"
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
  );
}
