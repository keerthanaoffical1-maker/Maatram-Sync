import {
  Building,
  GraduationCap,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { StudentProfile } from '../../types/student';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface ProfileTabProps {
  profile: StudentProfile;
  onUpdateProfile?: (updates: Partial<StudentProfile>) => Promise<void>;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Official Verification Notice */}
      <div className="rounded-2xl border border-charcoal/15 bg-white p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-gold ring-1 ring-charcoal/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{profile.name}</h2>
              <Badge variant="success" size="sm">
                Verified Scholar
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-charcoal/70 sm:text-sm">
              Scholar ID: <strong className="text-ink">{profile.studentId}</strong> • {profile.department}
            </p>
          </div>
        </div>
      </div>

      {/* Official & Locked Details Card */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-charcoal/70" />
              <span>Official Institutional Record</span>
              <span className="rounded bg-charcoal/10 px-2 py-0.5 text-[10px] font-bold text-charcoal">
                Verified
              </span>
            </div>
          }
          subtitle="Official institutional enrollment details are managed exclusively by the Maatram Academic Council."
        />
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-offwhite p-3.5 border border-charcoal/15 text-xs text-charcoal/80">
            <Info className="h-4 w-4 text-charcoal shrink-0 mt-0.5" />
            <p>
              To update your official institutional record (e.g. transfer of branch, grade year, or registration ID), please contact the academic office at{' '}
              <strong className="text-ink">academic-office@maatram.dev</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Official Student Name
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-semibold text-ink">{profile.name}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Maatram Scholar ID
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal font-mono">
                <span className="font-semibold text-ink">{profile.studentId}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* System Role */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Assigned Role
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-bold text-ink uppercase tracking-wide">Student</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Institution */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Academic Institution
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-medium text-ink truncate">{profile.institution}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40 shrink-0 ml-2" />
              </div>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Academic Year
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-medium text-ink">{profile.academicYear}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Department */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Department / Branch
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-medium text-ink">{profile.department}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Enrollment Status
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <Badge variant={profile.enrollmentStatus === 'Active' ? 'success' : 'neutral'} size="sm">
                  {profile.enrollmentStatus}
                </Badge>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Primary Email */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Registered Email
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-medium text-ink truncate">{profile.email}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Contact Phone
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-medium text-ink">{profile.phone || 'Not recorded'}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
