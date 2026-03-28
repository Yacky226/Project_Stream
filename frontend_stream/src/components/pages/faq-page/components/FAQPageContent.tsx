import { ArrowRight, HelpCircle, MessageSquare, Search } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../ui/accordion';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import type { FAQPageDataModel } from '../faq.types';

interface FAQPageContentProps {
  model: FAQPageDataModel;
  onNavigate: (path: string) => void;
}

export function FAQPageContent({ model, onNavigate }: FAQPageContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl md:text-5xl">Centre d&apos;aide</h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Trouvez rapidement les reponses a vos questions
          </p>
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher dans les questions frequentes..."
                value={model.searchTerm}
                onChange={(event) => model.setSearchTerm(event.target.value)}
                className="border-white/20 bg-white/10 py-4 pl-12 text-lg text-white placeholder:text-white/60"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h3 className="mb-4 text-lg font-semibold">Categories</h3>
                <div className="space-y-2">
                  {model.categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={model.selectedCategory === category.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => model.setSelectedCategory(category.id)}
                    >
                      <category.icon className="mr-2 h-4 w-4" />
                      {category.name}
                      <Badge variant="secondary" className="ml-auto">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>

                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Besoin d&apos;aide ?</CardTitle>
                    <CardDescription>Notre equipe support est la pour vous aider</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => onNavigate('/contact')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contacter le support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-semibold">
                  Questions frequentes
                  {model.searchTerm ? (
                    <span className="ml-2 text-lg font-normal text-muted-foreground">
                      - Resultats pour "{model.searchTerm}"
                    </span>
                  ) : null}
                </h2>
                <p className="text-muted-foreground">
                  {model.filteredFaqs.length} question(s) trouvee(s)
                </p>
              </div>

              {model.filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {model.filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="rounded-lg border px-6">
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center">
                          <HelpCircle className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
                          {faq.question}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pl-8 text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <HelpCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">Aucun resultat trouve</h3>
                    <p className="mb-4 text-muted-foreground">
                      Essayez de modifier vos termes de recherche ou selectionnez une autre
                      categorie.
                    </p>
                    <Button variant="outline" onClick={model.resetFilters}>
                      Reinitialiser les filtres
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="mt-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">
                        Vous ne trouvez pas votre reponse ?
                      </h3>
                      <p className="text-muted-foreground">
                        Notre equipe support est disponible pour vous aider personnellement.
                      </p>
                    </div>
                    <Button onClick={() => onNavigate('/contact')}>
                      Nous contacter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
