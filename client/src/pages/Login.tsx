import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Sparkles, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {step === 'username' ? (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl blur-lg opacity-75"></div>
                  <div className="relative bg-slate-900 rounded-2xl p-4">
                    <Sparkles className="w-8 h-8 text-transparent bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Habbo Marketplace
              </h1>
              <p className="text-gray-400 text-lg">Acesse o painel de negociação</p>
            </div>

            {/* Login Card */}
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <form onSubmit={generateCode} className="space-y-6">
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome de Utilizador
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Insira seu nome Habbo"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Gerando código...
                    </>
                  ) : (
                    <>
                      Gerar Código
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Info Steps */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Como funciona?
                </h3>
                <div className="space-y-3">
                  {[
                    { num: 1, text: 'Insira seu nome de utilizador' },
                    { num: 2, text: 'Clique em "Gerar Código"' },
                    { num: 3, text: 'Copie o código gerado' },
                    { num: 4, text: 'Cole na sua missão no Habbo' },
                    { num: 5, text: 'Volte e verifique' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {step.num}
                      </div>
                      <span className="text-gray-300 text-sm">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Dados armazenados apenas localmente no seu navegador
            </p>
          </>
        ) : (
          <>
            {/* Verify Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-3">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2 text-white">
                Verificar Código
              </h1>
              <p className="text-gray-400">Coloque o código na sua missão do Habbo</p>
            </div>

            {/* Verify Card */}
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <form onSubmit={verifyCodeInMission} className="space-y-6">
                {/* Code Display */}
                <div>
                  <p className="text-sm text-gray-400 mb-3">Seu código de verificação:</p>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-slate-900 rounded-2xl p-6 flex items-center justify-between">
                      <code className="text-4xl font-bold tracking-widest bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
                        {generatedCode}
                      </code>
                      <button
                        type="button"
                        onClick={copyCode}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          copied
                            ? 'bg-green-500/30 text-green-300'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {copied ? '✓ Copiado' : '📋 Copiar'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Verify Input */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Cole o código da missão
                  </label>
                  <input
                    type="text"
                    placeholder="Código que colocou na missão"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all"
                  />
                </div>

                {/* Buttons */}
                <button
                  type="submit"
                  disabled={loading || !verifyCode.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verificando...
                    </>
                  ) : (
                    'Verificar Código'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('username');
                    setUsername('');
                    setVerifyCode('');
                    setGeneratedCode('');
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3 rounded-xl border border-white/20 transition-all"
                >
                  Voltar
                </button>
              </form>

              {/* Instructions */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="font-semibold text-white mb-4">Próximos passos:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                    Copie o código acima
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Abra o Habbo e acesse sua missão
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Cole o código na missão
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                    Volte aqui e verifique
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
