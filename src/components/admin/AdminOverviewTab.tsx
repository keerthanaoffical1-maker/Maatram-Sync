import { useMemo } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  History,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import type {
  AdminActivityItem,
  AdminOverviewMetrics,
  AdminStudentItem,
  InstitutionItem,
} from '../../types/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import type { AdminNavTab } from './AdminSidebar';

interface AdminOverviewTabProps {
  metrics: AdminOverviewMetrics;
  recentStudents: AdminStudentItem[];
  institutions?: InstitutionItem[];
  institutionDistribution?: Array<{ name: string; code: string; count: number; percentage: number }>;
  activities: AdminActivityItem[];
  onNavigateTab: (tab: AdminNavTab) => void;
}

export function AdminOverviewTab({
  metrics,
  recentStudents,
  institutions = [],
  institutionDistribution: propInstDist,
  activities,
  onNavigateTab,
}: AdminOverviewTabProps) {
  const institutionDistribution = useMemo(() => {
    if (propInstDist) return propInstDist;
    const total = metrics.totalRegisteredStudents || 1;
    return institutions.map((inst) => ({
      name: inst.name,
      code: inst.code,
      count: inst.registeredStudentCount,
      percentage: Math.round((inst.registeredStudentCount / total) * 100),
    }));
  }, [propInstDist, institutions, metrics.totalRegisteredStudents]);
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/40">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Platform Governance & Registration Authority</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Academic Infrastructure & Scholar Records
            </h2>
            <p className="text-sm leading-relaxed text-white/75 sm:text-base">
              Register new scholars, manage institutional affiliations, monitor student availability, and audit system activities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigateTab('registration')}
              className="w-full sm:w-auto px-6 font-bold shadow-lg shadow-gold/20"
            >
              <UserPlus className="h-5 w-5 text-ink" />
              <span>Register Scholar</span>
              <ArrowRight className="h-4 w-4 text-ink" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigateTab('institutions')}
              className="w-full sm:w-auto px-5 font-semibold"
            >
              <Building2 className="h-4 w-4" />
              <span>Institutions</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Total Registered Students */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('students')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Total Registered Students
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-ink group-hover:bg-gold transition-colors">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {metrics.totalRegisteredStudents}
                </span>
                <Badge variant="gold" size="sm">
                  Active DB
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                Verified scholars across all affiliated institutions
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>View full directory</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Total Institutions */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('institutions')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Partner Institutions
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-ink group-hover:bg-gold transition-colors">
                <Building2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {metrics.totalInstitutions}
                </span>
                <Badge variant="neutral" size="sm">
                  Colleges
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                Engineering colleges in Tamil Nadu network
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>Manage institutions</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        {/* 3. Active Students */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('students')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Active Scholar Accounts
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200 transition-colors">
                <UserCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {metrics.activeStudents}
                </span>
                <Badge variant="success" size="sm" dot>
                  {Math.round((metrics.activeStudents / metrics.totalRegisteredStudents) * 100)}%
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                Accounts active with verified access
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>View account status</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        {/* 4. Students Added Recently */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('registration')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Added Recently
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-ink group-hover:bg-gold transition-colors">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  +{metrics.studentsAddedRecently}
                </span>
                <Badge variant="gold" size="sm">
                  Last 30 Days
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                Scholars enrolled through single & bulk import
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>Register new scholars</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Institution Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institution Distribution */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gold" />
                <span>Institution Distribution</span>
              </div>
            }
            subtitle="Registered scholar density across engineering partner colleges"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('institutions')}
                className="text-xs"
              >
                View all ({institutionDistribution.length})
              </Button>
            }
          />
          <CardContent className="space-y-3.5">
            {institutionDistribution.map((inst) => (
              <div key={inst.code} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-charcoal font-semibold">
                  <span className="truncate max-w-[240px]">
                    {inst.name} ({inst.code})
                  </span>
                  <span className="font-mono text-ink">
                    {inst.count} scholars ({inst.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-charcoal/10 overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-300"
                    style={{ width: `${inst.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Platform Governance & Operational Status */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <span>Governance & Platform Health</span>
              </div>
            }
            subtitle="System registration metrics and active account coverage"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('students')}
                className="text-xs"
              >
                View Directory
              </Button>
            }
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-charcoal/10 bg-offwhite/50 p-3.5">
                <span className="text-[10px] uppercase font-bold text-charcoal/60 block">
                  Active Scholar Ratio
                </span>
                <span className="text-xl font-extrabold text-ink mt-1 block">
                  {Math.round((metrics.activeStudents / (metrics.totalRegisteredStudents || 1)) * 100)}%
                </span>
                <span className="text-[11px] text-charcoal/60">
                  {metrics.activeStudents} of {metrics.totalRegisteredStudents} active
                </span>
              </div>

              <div className="rounded-xl border border-charcoal/10 bg-offwhite/50 p-3.5">
                <span className="text-[10px] uppercase font-bold text-charcoal/60 block">
                  Partner Colleges
                </span>
                <span className="text-xl font-extrabold text-ink mt-1 block">
                  {metrics.totalInstitutions}
                </span>
                <span className="text-[11px] text-charcoal/60">
                  Engineering colleges
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-charcoal/10 bg-white p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-ink block">Database Synchronization</span>
                <span className="text-[11px] text-charcoal/70">Supabase live records verified and active</span>
              </div>
              <Badge variant="success" size="sm" dot>
                Synchronized
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Recently Registered Scholars & Administrative Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Registered Scholars */}
        <Card>
          <CardHeader
            title="Recently Registered Scholars"
            subtitle="Latest scholar enrollment submissions"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('students')}
                className="text-xs"
              >
                Full Directory
              </Button>
            }
          />
          <CardContent className="p-0">
            <div className="divide-y divide-charcoal/10">
              {recentStudents.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-offwhite/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-xs font-bold text-gold">
                      {student.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-ink truncate">{student.name}</p>
                      <p className="text-[11px] text-charcoal/60 truncate">
                        {student.studentId} • {student.institution.split(',')[0]}
                      </p>
                    </div>
                  </div>
                  <Badge variant={student.accountStatus === 'Active' ? 'success' : 'charcoal'} size="sm">
                    {student.accountStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Administrative Activities */}
        <Card>
          <CardHeader
            title="Recent Administrative Activities"
            subtitle="Governance audit trail of actions taken by administrators"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('activity')}
                className="text-xs"
              >
                Full Audit Log
              </Button>
            }
          />
          <CardContent className="space-y-3">
            {activities.slice(0, 4).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-xl border border-charcoal/10 bg-white p-3 hover:border-gold/50 transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-ink mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-bold text-ink truncate">{act.action}</h5>
                    <span className="text-[10px] text-charcoal/50 shrink-0">{act.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-charcoal/75 leading-relaxed line-clamp-2">
                    {act.details}
                  </p>
                  <p className="mt-1 text-[10px] text-charcoal/50 font-mono">
                    Target: {act.affectedRecord}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
