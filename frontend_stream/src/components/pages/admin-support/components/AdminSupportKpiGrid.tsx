import { CheckCircle2, Clock3, MessageSquareText, Send } from "lucide-react";
import { AdminKpiCard } from "../../../admin/AdminPageSections";
import { compact } from "../../../admin/support/adminSupport.utils";
import type { AdminSupportDataModel } from "../useAdminSupportData";

interface AdminSupportKpiGridProps {
  overview: AdminSupportDataModel["overview"];
  resolutionCoverage: number;
}

export function AdminSupportKpiGrid({
  overview,
  resolutionCoverage,
}: AdminSupportKpiGridProps) {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {[
        {
          title: "Pending Queue",
          value: compact(overview?.pendingContactRequests || 0),
          meta: `${compact(overview?.newContactRequests || 0)} new requests`,
          icon: Clock3,
          accent: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
        },
        {
          title: "Monthly Inbound",
          value: compact(overview?.monthlyContactRequests || 0),
          meta: `${compact(overview?.totalContactRequests || 0)} total requests`,
          icon: MessageSquareText,
          accent: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
        },
        {
          title: "Active Subscribers",
          value: compact(overview?.activeNewsletterSubscriptions || 0),
          meta: `${compact(overview?.monthlyNewsletterSubscriptions || 0)} joined this month`,
          icon: Send,
          accent: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300",
        },
        {
          title: "Resolution Coverage",
          value: `${resolutionCoverage.toFixed(0)}%`,
          meta: `${compact(
            (overview?.resolvedContactRequests || 0) + (overview?.closedContactRequests || 0),
          )} handled`,
          icon: CheckCircle2,
          accent:
            "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
        },
      ].map((card) => (
        <AdminKpiCard
          key={card.title}
          title={card.title}
          value={card.value}
          meta={card.meta}
          icon={card.icon}
          iconToneClass={card.accent}
        />
      ))}
    </section>
  );
}
