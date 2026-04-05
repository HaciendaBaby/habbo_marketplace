import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

const glassStyle = {
  background: 'rgba(30, 30, 80, 0.4)',
  border: '1px solid rgba(100, 100, 200, 0.3)',
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
      // Verificar se o utilizador existe na API Habbo
      const response = await fetch(
        `https://api.habbo.com.br/api/public/users/${encodeURIComponent(username)}`
      );
      
      if (!response.ok) {
        toast.error('Utilizador não encontrado no Habbo');
        setLoading(false);
        return;
      }

      // Gerar código aleatório de 8 caracteres
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
      // Buscar dados do utilizador
      const response = await fetch(
        `https://api.habbo.com.br/api/public/users/${encodeURIComponent(username)}`
      );
      
      if (!response.ok) {
        toast.error('Utilizador não encontrado');
        setLoading(false);
        return;
      }
      
      const userData = await response.json();
      
      // Verificar se o código está na missão (motto)
      if (userData.motto && userData.motto.includes(verifyCode.trim())) {
        // Armazenar dados do utilizador no localStorage
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: gradientBg }}>
            <span className="text-2xl">🎮</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={gradientText}>
            Habbo Marketplace
          </h1>
          <p className="text-gray-400">Autentique-se com sua conta Habbo</p>
        </div>

        {/* Step 1: Username */}
        {step === 'username' && (
          <form onSubmit={generateCode} className="space-y-4">
            <div className="p-6 rounded-2xl" style={glassStyle}>
              <label className="block text-sm font-medium text-white mb-3">
                Nome de Utilizador Habbo
              </label>
              <input
                type="text"
                placeholder="ex: whatwasit"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full mb-4 px-4 py-2 bg-transparent border border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                disabled={loading || !username.trim()}
                style={{ background: gradientBg }}
                className="w-full text-white font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gerando código...' : 'Gerar Código de Verificação'}
              </button>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl" style={glassStyle}>
              <h3 className="font-semibold text-white mb-3">Como funciona?</h3>
              <ol className="text-sm text-gray-300 space-y-2">
                <li><strong>1.</strong> Insira seu nome de utilizador do Habbo</li>
                <li><strong>2.</strong> Clique em "Gerar Código"</li>
                <li><strong>3.</strong> Copie o código gerado</li>
                <li><strong>4.</strong> Cole o código na sua missão no Habbo</li>
                <li><strong>5.</strong> Volte aqui e clique em "Verificar"</li>
              </ol>
            </div>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 'verify' && (
          <form onSubmit={verifyCodeInMission} className="space-y-4">
            <div className="p-6 rounded-2xl" style={glassStyle}>
              <p className="text-sm text-gray-300 mb-3">Seu código de verificação:</p>
              
              {/* Code Display */}
              <div className="flex items-center gap-2 p-4 rounded-lg mb-6" style={{
                background: 'rgba(100, 100, 200, 0.2)',
                border: '2px solid rgba(236, 72, 153, 0.5)'
              }}>
                <code className="text-3xl font-bold flex-1 tracking-widest" style={gradientText}>
                  {generatedCode}
                </code>
                <button
                  type="button"
                  onClick={copyCode}
                  className="text-gray-400 hover:text-white px-3 py-2"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>

              {/* Verify Input */}
              <label className="block text-sm font-medium text-white mb-3">
                Código da Missão
              </label>
              <input
                type="text"
                placeholder="Cole o código que colocou na missão"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                disabled={loading}
                className="w-full mb-4 px-4 py-2 bg-transparent border border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-pink-500"
              />

              {/* Buttons */}
              <button
                type="submit"
                disabled={loading || !verifyCode.trim()}
                style={{ background: gradientBg }}
                className="w-full text-white font-semibold py-2 rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
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
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-xl" style={glassStyle}>
              <h3 className="font-semibold text-white mb-2">Próximos passos</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ Copie o código acima</li>
                <li>✓ Abra o Habbo e acesse sua missão</li>
                <li>✓ Cole o código na missão</li>
                <li>✓ Volte aqui e cole o código no campo acima</li>
                <li>✓ Clique em "Verificar Código"</li>
              </ul>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Esta aplicação usa a API pública do Habbo.com.br<br/>
          Seus dados são armazenados apenas localmente no seu navegador
        </p>
      </div>
    </div>
  );
}
