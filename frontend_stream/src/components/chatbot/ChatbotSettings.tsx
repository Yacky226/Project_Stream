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
import { ChatbotProvider, getProviderConfig } from '../../lib/chatbotConfig';

interface ChatbotSettingsProps {
  onClose?: () => void;
  onSave?: (config: any) => void;
}

export function ChatbotSettings({ onClose, onSave }: ChatbotSettingsProps) {
  const [provider, setProvider] = useState<ChatbotProvider>('mock');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4-turbo-preview');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([500]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isTestMode, setIsTestMode] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleProviderChange = (newProvider: ChatbotProvider) => {
    setProvider(newProvider);
    const config = getProviderConfig(newProvider);
    setModel(config.model);
    setSystemPrompt(config.systemPrompt);
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
      testMode: isTestMode
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
              <CardDescription>
                Personnalisez l{'\''}assistant IA selon vos besoins
              </CardDescription>
            </div>
          </div>
          {isSaved && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Sauvegardé
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
              Paramètres
            </TabsTrigger>
            <TabsTrigger value="prompt">
              <MessageSquare className="h-4 w-4 mr-2" />
              Prompt
            </TabsTrigger>
          </TabsList>

          {/* Onglet Provider */}
          <TabsContent value="provider" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Service IA</Label>
              <Select value={provider} onValueChange={(v) => handleProviderChange(v as ChatbotProvider)}>
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mock">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Démo</Badge>
                      Mode Mock (Sans API)
                    </div>
                  </SelectItem>
                  <SelectItem value="openai">
                    <div className="flex items-center gap-2">
                      <Badge>Recommandé</Badge>
                      OpenAI GPT-4
                    </div>
                  </SelectItem>
                  <SelectItem value="anthropic">
                    Anthropic Claude
                  </SelectItem>
                  <SelectItem value="gemini">
                    Google Gemini
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground">
                {provider === 'mock' && '✨ Mode démo avec réponses simulées'}
                {provider === 'openai' && '🚀 Utilise GPT-4 pour des réponses de haute qualité'}
                {provider === 'anthropic' && '🧠 Utilise Claude pour des conversations sûres et nuancées'}
                {provider === 'gemini' && '⚡ Utilise Gemini Pro pour des réponses rapides'}
              </p>
            </div>

            {provider !== 'mock' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Clé API</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder={`Entrez votre clé API ${provider}...`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-900 dark:text-amber-200">
                      <strong>Important :</strong> Ne partagez jamais votre clé API. 
                      En production, utilisez des variables d{'\''}environnement serveur.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modèle</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provider === 'openai' && (
                        <>
                          <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo (Recommandé)</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Économique)</SelectItem>
                        </>
                      )}
                      {provider === 'anthropic' && (
                        <>
                          <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet (Recommandé)</SelectItem>
                          <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku (Rapide)</SelectItem>
                        </>
                      )}
                      {provider === 'gemini' && (
                        <>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                          <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label>Mode Test</Label>
                <p className="text-muted-foreground">
                  Testez la configuration sans consommer de tokens
                </p>
              </div>
              <Switch checked={isTestMode} onCheckedChange={setIsTestMode} />
            </div>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="parameters" className="space-y-6 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Température</Label>
                <span className="text-muted-foreground">{temperature[0]}</span>
              </div>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-muted-foreground">
                Contrôle la créativité des réponses. 
                <strong> 0 = Déterministe</strong>, <strong>2 = Très créatif</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tokens Maximum</Label>
                <span className="text-muted-foreground">{maxTokens[0]}</span>
              </div>
              <Slider
                value={maxTokens}
                onValueChange={setMaxTokens}
                min={100}
                max={2000}
                step={50}
                className="w-full"
              />
              <p className="text-muted-foreground">
                Longueur maximale des réponses. 1 token ≈ 0.75 mots
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-blue-600" />
                Conseils d{'\''}optimisation
              </h4>
              <ul className="space-y-1 text-blue-900 dark:text-blue-200">
                <li>• Température 0.7 est idéale pour un chatbot de support</li>
                <li>• 500 tokens suffisent pour la plupart des réponses</li>
                <li>• Augmentez si vous avez besoin de réponses détaillées</li>
              </ul>
            </div>
          </TabsContent>

          {/* Onglet Prompt */}
          <TabsContent value="prompt" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">Prompt Système</Label>
              <Textarea
                id="systemPrompt"
                placeholder="Tu es un assistant virtuel pour Stream Éducatif..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={12}
                className="font-mono"
              />
              <p className="text-muted-foreground">
                Définit le comportement et la personnalité du chatbot
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h4 className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                Éléments clés d{'\''}un bon prompt
              </h4>
              <ul className="space-y-1 text-purple-900 dark:text-purple-200">
                <li>• Définissez clairement le rôle et le contexte</li>
                <li>• Précisez les connaissances et limitations</li>
                <li>• Incluez des instructions de style et de ton</li>
                <li>• Ajoutez des exemples si nécessaire</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {/* Boutons d'action */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
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
