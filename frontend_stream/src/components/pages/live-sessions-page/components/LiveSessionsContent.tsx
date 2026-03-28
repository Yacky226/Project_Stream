import {
  AlertCircle,
  CircleOff,
  Radio,
  Search,
  Settings2,
  Users,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { LiveSessionsDataModel, StatusFilter } from '../liveSessions.types';
import { LiveSessionsSessionCard } from './LiveSessionsSessionCard';

interface LiveSessionsContentProps {
  model: LiveSessionsDataModel;
  onNavigate: (path: string) => void;
}

export function LiveSessionsContent({ model, onNavigate }: LiveSessionsContentProps) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Sessions live</h1>
          <p className="mt-2 text-muted-foreground">
            Catalogue branche au backend. Rejoignez ou gerez les sessions en direct.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive" className="px-3 py-1">
            <Radio className="mr-1 h-3 w-3 animate-pulse" />
            {model.liveCount} en direct
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Users className="mr-1 h-3 w-3" />
            {model.upcomingCount} a venir
          </Badge>
          {model.canManage ? (
            <Button size="sm" variant="outline" onClick={() => onNavigate('/teacher/live-sessions')}>
              <Settings2 className="mr-2 h-4 w-4" />
              Gerer mes lives
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={model.searchQuery}
            onChange={(event) => model.setSearchQuery(event.target.value)}
            placeholder="Rechercher par session, cours ou enseignant..."
            className="pl-9"
          />
        </div>
        <Select
          value={model.statusFilter}
          onValueChange={(value) => model.setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="live">En direct</SelectItem>
            <SelectItem value="scheduled">Planifiees</SelectItem>
            <SelectItem value="ended">Terminees</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={model.refreshSessions}>
          Actualiser
        </Button>
      </div>

      {model.hasError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Impossible de charger les sessions live.</AlertDescription>
        </Alert>
      ) : null}

      {model.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={String(index)}>
              <CardHeader>
                <CardTitle className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                <CardDescription className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : model.filteredSessions.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {model.filteredSessions.map((session) => (
            <LiveSessionsSessionCard
              key={session.id}
              session={session}
              canManage={model.canManage}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <CircleOff className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune session ne correspond aux filtres.</p>
            <Button variant="outline" onClick={model.resetFilters}>
              Reinitialiser
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
