import { Accessibility, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import type { AccessibilityPageDataModel } from '../accessibility.types';

interface AccessibilityContentProps {
  model: AccessibilityPageDataModel;
  onNavigate: (path: string) => void;
}

export function AccessibilityContent({ model, onNavigate }: AccessibilityContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex items-center justify-center">
              <Accessibility className="mr-4 h-12 w-12" />
              <h1 className="text-4xl font-bold md:text-5xl">Accessibilite</h1>
            </div>
            <p className="mb-6 text-xl text-green-100">
              Stream Educatif s&apos;engage a rendre l&apos;apprentissage accessible a tous, sans
              exception ni discrimination.
            </p>
            <Badge variant="secondary" className="bg-white/20 px-4 py-2 text-lg text-white">
              Conforme WCAG 2.1 AA
            </Badge>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Notre engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  Nous croyons fermement que l&apos;education est un droit universel. C&apos;est
                  pourquoi Stream Educatif a ete concue des le depart pour etre accessible a tous
                  les apprenants, quels que soient leurs besoins ou leurs capacites.
                </p>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  Notre plateforme respecte et depasse les standards internationaux
                  d&apos;accessibilite numerique, et nous ameliorons continuellement notre interface
                  pour offrir une experience d&apos;apprentissage inclusive et enrichissante.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button onClick={() => onNavigate('/contact')}>
                    Signaler un probleme d&apos;accessibilite
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate('/help')}>
                    Guide d&apos;utilisation accessible
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Fonctionnalites d&apos;accessibilite
          </h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {model.features.map((feature) => (
              <Card key={feature.category} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div
                      className={`mr-4 flex h-12 w-12 items-center justify-center rounded-lg ${feature.backgroundClass}`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.colorClass}`} />
                    </div>
                    {feature.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.items.map((item) => (
                      <li key={item} className="flex items-start">
                        <CheckCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">Conformite aux standards</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {model.standards.map((standard) => (
                <Card key={standard.name} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">{standard.name}</CardTitle>
                    <Badge variant="outline" className="border-green-600 text-green-600">
                      {standard.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-sm text-muted-foreground">{standard.description}</p>
                    <p className="text-sm font-semibold">Niveau : {standard.level}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Compatibilite des outils d&apos;assistance
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {model.tools.map((tool) => (
                <Card key={tool.name}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                          <tool.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">{tool.compatibility}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-3 h-6 w-6 text-orange-600" />
                  Signaler un probleme d&apos;accessibilite
                </CardTitle>
                <CardDescription>
                  Votre retour nous aide a ameliorer continuellement notre plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-muted-foreground">
                  Si vous rencontrez des difficultes d&apos;accessibilite sur notre plateforme, nous
                  vous encourageons vivement a nous le signaler. Votre retour est precieux pour
                  nous aider a identifier et corriger rapidement tout probleme.
                </p>
                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-semibold">Comment signaler :</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {model.reportChannels.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold">Informations utiles :</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {model.reportDetails.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button onClick={() => onNavigate('/contact')}>Signaler un probleme</Button>
                  <Button variant="outline" onClick={() => onNavigate('/help')}>
                    Consulter l&apos;aide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold">Nos prochaines ameliorations</h2>
            <p className="mb-8 text-muted-foreground">
              Nous continuons d&apos;innover pour rendre notre plateforme encore plus accessible
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {model.improvements.map((improvement) => (
                <Card key={improvement.title}>
                  <CardContent className="p-6 text-center">
                    <improvement.icon className={`mx-auto mb-4 h-8 w-8 ${improvement.colorClass}`} />
                    <h3 className="mb-2 font-semibold">{improvement.title}</h3>
                    <p className="text-sm text-muted-foreground">{improvement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
