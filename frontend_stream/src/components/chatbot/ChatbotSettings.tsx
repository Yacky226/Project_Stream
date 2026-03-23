import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Bot, Key, Sliders, MessageSquare, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  ChatbotProvider,
  defaultConfig,
  getProviderApiKey,
  getProviderConfig,
  isStrictApiModeEnabled,
} from '../../lib/chatbotConfig';

interface ChatbotSettingsProps {
  onClose?: () => void;
  onSave?: (config: any) => void;
}

export function ChatbotSettings({ onClose, onSave }: ChatbotSettingsProps) {
  const strictApiMode = isStrictApiModeEnabled();
  const initialProvider: ChatbotProvider = (() => {
    if (!strictApiMode || defaultConfig.provider !== 'mock') {
      return defaultConfig.provider;
    }
    if (getProviderApiKey('gemini')) return 'gemini';
    if (getProviderApiKey('openai')) return 'openai';
    if (getProviderApiKey('anthropic')) return 'anthropic';
    return 'openai';
  })();
  const initialConfig = getProviderConfig(initialProvider);
  const [provider, setProvider] = useState<ChatbotProvider>(initialProvider);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(initialConfig.model);
  const [temperature, setTemperature] = useState([initialConfig.temperature]);
  const [maxTokens, setMaxTokens] = useState([initialConfig.maxTokens]);
  const [systemPrompt, setSystemPrompt] = useState(initialConfig.systemPrompt);
  const [isTestMode, setIsTestMode] = useState(!strictApiMode && initialConfig.provider === 'mock');
  const [isSaved, setIsSaved] = useState(false);

  const hasEnvApiKey = Boolean(getProviderApiKey(provider));
  const providerDescription = strictApiMode
    ? 'Mode strict API actif: fallback local desactive.'
    : provider === 'mock'
      ? 'Mode demo avec reponses simulees'
      : provider === 'openai'
        ? 'Utilise OpenAI pour des reponses avancees'
        : provider === 'anthropic'
          ? 'Utilise Claude pour des conversations nuancees'
          : 'Utilise Gemini pour des reponses rapides';

  const handleProviderChange = (newProvider: ChatbotProvider) => {
    if (strictApiMode && newProvider === 'mock') {
      return;
    }

    setProvider(newProvider);
    const config = getProviderConfig(newProvider);
    setModel(config.model);
    setTemperature([config.temperature]);
    setMaxTokens([config.maxTokens]);
    setSystemPrompt(config.systemPrompt);
    setApiKey('');
    setIsTestMode(!strictApiMode && newProvider === 'mock');
    setIsSaved(false);
  };

  const handleSave = () => {
    const config = {
      provider,
      apiKey: apiKey || undefined,
      model,
      temperature: temperature[0],
      maxTokens: maxTokens[0],
      systemPrompt,
      testMode: strictApiMode ? false : isTestMode,
    };

    onSave?.(config);
    setIsSaved(true);

    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    const config = getProviderConfig(provider);
    setModel(config.model);
    setTemperature([config.temperature]);
    setMaxTokens([config.maxTokens]);
    setSystemPrompt(config.systemPrompt);
    setApiKey('');
    setIsSaved(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Configuration du Chatbot</CardTitle>
              <CardDescription>Personnalisez l'assistant IA selon vos besoins</CardDescription>
            </div>
          </div>
          {isSaved && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Sauvegarde
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="provider" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="provider">
              <Key className="h-4 w-4 mr-2" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="parameters">
              <Sliders className="h-4 w-4 mr-2" />
              Parametres
            </TabsTrigger>
            <TabsTrigger value="prompt">
              <MessageSquare className="h-4 w-4 mr-2" />
              Prompt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="provider" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Service IA</Label>
              <Select value={provider} onValueChange={(v) => handleProviderChange(v as ChatbotProvider)}>
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {!strictApiMode && (
                    <SelectItem value="mock">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Demo</Badge>
                        Mode Mock (Sans API)
                      </div>
                    </SelectItem>
                  )}
                  <SelectItem value="openai">
                    <div className="flex items-center gap-2">
                      <Badge>Recommande</Badge>
                      OpenAI
                    </div>
                  </SelectItem>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground">{providerDescription}</p>
            </div>

            {provider !== 'mock' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Cle API</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder={
                      hasEnvApiKey
                        ? "Cle chargee via variables d'environnement (laisser vide pour utiliser celle-ci)"
                        : `Entrez votre cle API ${provider}...`
                    }
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  {hasEnvApiKey && (
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Une cle API est deja configuree dans l'environnement pour ce provider.
                    </p>
                  )}
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-900 dark:text-amber-200">
                      <strong>Important :</strong> Ne partagez jamais votre cle API.
                      En production, utilisez des variables d'environnement serveur.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modele</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provider === 'openai' && (
                        <>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini (Recommande)</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini</SelectItem>
                        </>
                      )}
                      {provider === 'anthropic' && (
                        <>
                          <SelectItem value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet (Recommande)</SelectItem>
                          <SelectItem value="claude-3-5-haiku-latest">Claude 3.5 Haiku</SelectItem>
                          <SelectItem value="claude-3-opus-latest">Claude Opus</SelectItem>
                        </>
                      )}
                      {provider === 'gemini' && (
                        <>
                          <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Recommande)</SelectItem>
                          <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                          <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {!strictApiMode ? (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-0.5">
                  <Label>Mode Test</Label>
                  <p className="text-muted-foreground">Testez la configuration sans consommer de tokens</p>
                </div>
                <Switch checked={isTestMode} onCheckedChange={setIsTestMode} />
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <Label>Mode Test</Label>
                <p className="text-muted-foreground">Desactive automatiquement en mode strict API.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="parameters" className="space-y-6 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Temperature</Label>
                <span className="text-muted-foreground">{temperature[0]}</span>
              </div>
              <Slider value={temperature} onValueChange={setTemperature} min={0} max={2} step={0.1} className="w-full" />
              <p className="text-muted-foreground">
                Controle la creativite des reponses.
                <strong> 0 = Deterministe</strong>, <strong>2 = Tres creatif</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tokens Maximum</Label>
                <span className="text-muted-foreground">{maxTokens[0]}</span>
              </div>
              <Slider value={maxTokens} onValueChange={setMaxTokens} min={100} max={2000} step={50} className="w-full" />
              <p className="text-muted-foreground">Longueur maximale des reponses. 1 token ~= 0.75 mots</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-blue-600" />
                Conseils d'optimisation
              </h4>
              <ul className="space-y-1 text-blue-900 dark:text-blue-200">
                <li>- Temperature 0.7 est ideale pour un chatbot de support</li>
                <li>- 500 tokens suffisent pour la plupart des reponses</li>
                <li>- Augmentez si vous avez besoin de reponses detaillees</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">Prompt Systeme</Label>
              <Textarea
                id="systemPrompt"
                placeholder="Tu es un assistant virtuel pour Stream Educatif..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={12}
                className="font-mono"
              />
              <p className="text-muted-foreground">Definit le comportement et la personnalite du chatbot</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h4 className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                Elements cles d'un bon prompt
              </h4>
              <ul className="space-y-1 text-purple-900 dark:text-purple-200">
                <li>- Definissez clairement le role et le contexte</li>
                <li>- Precisez les connaissances et limitations</li>
                <li>- Incluez des instructions de style et de ton</li>
                <li>- Ajoutez des exemples si necessaire</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reinitialiser
          </Button>
          <div className="flex items-center gap-2">
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                Annuler
              </Button>
            )}
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
