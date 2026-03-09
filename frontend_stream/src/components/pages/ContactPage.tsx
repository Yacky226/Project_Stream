import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from '../../lib/i18n';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Users,
  Shield
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl mb-4">Contactez-nous</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Une question ? Un projet ? Notre équipe est là pour vous aider
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl mb-6">Envoyez-nous un message</h2>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Nom complet *
                        </label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder="Votre nom"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Sujet *
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        required
                        placeholder="De quoi souhaitez-vous parler ?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        required
                        placeholder="Décrivez votre demande en détail..."
                        rows={5}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Envoi en cours...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl mb-6">Nos coordonnées</h2>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Email</h3>
                          <p className="text-muted-foreground">contact@stream-educatif.fr</p>
                          <p className="text-sm text-muted-foreground">Réponse sous 24h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Téléphone</h3>
                          <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                          <p className="text-sm text-muted-foreground">Lun-Ven 9h-18h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Adresse</h3>
                          <p className="text-muted-foreground">123 Avenue de l'Innovation</p>
                          <p className="text-muted-foreground">75001 Paris, France</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Horaires d'ouverture</h3>
                          <p className="text-muted-foreground">Lundi - Vendredi : 9h - 18h</p>
                          <p className="text-muted-foreground">Weekend : Fermé</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* FAQ Links */}
              <div>
                <h3 className="text-xl mb-4">Liens utiles</h3>
                <div className="space-y-3">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('/faq')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Questions fréquentes
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('/help')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Centre d'aide
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('/terms')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Conditions d'utilisation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}