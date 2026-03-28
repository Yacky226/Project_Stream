import {
  Check,
  CheckCheck,
  Loader2,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Button } from '../../../ui/button';
import type { NotificationsPageDataModel } from '../notificationsPage.types';
import {
  formatNotificationDate,
  getNotificationFilterLabel,
  notificationFilters,
} from '../notificationsPage.utils';

interface NotificationsPageBodyProps {
  model: NotificationsPageDataModel;
}

export function NotificationsPageBody({ model }: NotificationsPageBodyProps) {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
          <p className={`mt-2 text-sm ${model.mutedTextClass}`}>
            Suivez vos alertes de plateforme, rappels et messages importants sans perdre le fil.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className={`rounded-2xl border px-4 py-3 ${model.summaryClass}`}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${model.mutedTextClass}`}>
              Unread
            </p>
            <p className="mt-1 text-2xl font-black text-[#1152d4]">{model.unreadCount}</p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 ${model.summaryClass}`}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${model.mutedTextClass}`}>
              Read
            </p>
            <p className="mt-1 text-2xl font-black text-[#1152d4]">{model.readCount}</p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={model.refresh}>
            {model.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </section>

      {model.errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{model.errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {notificationFilters.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => model.setFilter(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                model.filter === option
                  ? 'bg-[#1152d4] text-white'
                  : model.isDark
                    ? 'bg-[#162033] text-[#cbd5e1]'
                    : 'bg-white text-[#475569] shadow-sm'
              }`}
            >
              {getNotificationFilterLabel(option)}
            </button>
          ))}
        </div>

        <Button
          className="rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
          onClick={() => void model.handleMarkAllRead()}
          disabled={!model.unreadCount || model.isMarkingAll}
        >
          {model.isMarkingAll ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="mr-2 h-4 w-4" />
          )}
          Tout marquer comme lu
        </Button>
      </section>

      {!model.notifications.length && !model.isLoading ? (
        <div className={`rounded-[28px] border border-dashed p-8 text-sm ${model.surfaceClass} ${model.mutedTextClass}`}>
          Aucune notification pour le moment.
        </div>
      ) : null}

      <section className="space-y-4">
        {model.filteredNotifications.length ? (
          model.filteredNotifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-[28px] border p-5 shadow-sm transition ${model.surfaceClass}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                        notification.read
                          ? model.isDark
                            ? 'bg-[#1f2937] text-[#cbd5e1]'
                            : 'bg-slate-100 text-slate-600'
                          : model.isDark
                            ? 'bg-[#1152d4]/20 text-[#8fb5ff]'
                            : 'bg-[#1152d4]/10 text-[#1152d4]'
                      }`}
                    >
                      {notification.read ? 'Read' : 'New'}
                    </span>
                    <span className={`text-xs ${model.mutedTextClass}`}>
                      {formatNotificationDate(notification.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold">{notification.title}</h2>
                  <p className={`mt-2 text-sm leading-6 ${model.mutedTextClass}`}>
                    {notification.message}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 lg:w-48 lg:justify-end">
                  {!notification.read ? (
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => void model.handleMarkRead(notification.id)}
                      disabled={model.isMarkingRead}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark as read
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    className="rounded-2xl text-red-600 hover:text-red-600"
                    onClick={() => void model.handleDelete(notification.id)}
                    disabled={model.isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))
        ) : model.notifications.length && !model.isLoading ? (
          <div className={`rounded-[28px] border border-dashed p-8 text-sm ${model.surfaceClass} ${model.mutedTextClass}`}>
            Aucun resultat pour cette recherche ou ce filtre.
          </div>
        ) : null}
      </section>
    </div>
  );
}
