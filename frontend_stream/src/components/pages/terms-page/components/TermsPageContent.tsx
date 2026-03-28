import { AlertTriangle, Clock, FileText, Shield } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Separator } from '../../../ui/separator';
import type { TermsPageDataModel } from '../terms.types';

interface TermsPageContentProps {
  model: TermsPageDataModel;
  onNavigate: (path: string) => void;
}

export function TermsPageContent({ model, onNavigate }: TermsPageContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl md:text-5xl">Conditions d&apos;utilisation</h1>
            <p className="text-xl text-blue-100">Derniere mise a jour : {model.lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Sommaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-2">
                      {model.sections.map((section) => (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className="block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {section.title}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-600">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Important
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Ces conditions sont juridiquement contraignantes. Veuillez les lire
                      attentivement avant d&apos;utiliser nos services.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="max-w-4xl">
                <div className="mb-8">
                  <div className="mb-4 flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Mis a jour le {model.lastUpdated}
                    </div>
                    <div className="flex items-center">
                      <Shield className="mr-1 h-4 w-4" />
                      Version {model.version}
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Bienvenue sur Stream Educatif. Ces conditions d&apos;utilisation regissent votre
                    acces et votre utilisation de notre plateforme d&apos;apprentissage en ligne. En
                    utilisant nos services, vous acceptez ces conditions dans leur integralite.
                  </p>
                </div>

                <div className="space-y-8">
                  {model.sections.map((section, index) => (
                    <div key={section.id} id={section.id}>
                      <h2 className="mb-4 text-2xl font-semibold">{section.title}</h2>
                      <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-line leading-relaxed text-muted-foreground">
                          {section.content}
                        </div>
                      </div>
                      {index < model.sections.length - 1 ? <Separator className="mt-8" /> : null}
                    </div>
                  ))}
                </div>

                <div className="mt-12 rounded-lg bg-muted/30 p-6">
                  <h3 className="mb-4 font-semibold">Questions sur ces conditions ?</h3>
                  <p className="mb-4 text-muted-foreground">
                    Si vous avez des questions concernant ces conditions d&apos;utilisation,
                    n&apos;hesitez pas a nous contacter.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Button onClick={() => onNavigate('/contact')}>Nous contacter</Button>
                    <Button variant="outline" onClick={() => onNavigate('/privacy')}>
                      Politique de confidentialite
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('/faq')}>
                      FAQ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
