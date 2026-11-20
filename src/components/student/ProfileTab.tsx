import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Building,
  Check,
  CheckCircle2,
  GraduationCap,
  Info,
  Link as LinkIcon,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import type { StudentProfile } from '../../types/student';
import { validatePhone } from '../../lib/validation';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface ProfileTabProps {
  profile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function ProfileTab({ profile, onUpdateProfile, onShowToast }: ProfileTabProps) {
  // Form state for permitted editable fields
  const [preferredName, setPreferredName] = useState(profile.preferredName || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [alternateEmail, setAlternateEmail] = useState(profile.alternateEmail || '');
  const [location, setLocation] = useState(profile.location || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || '');
  const [emailAlerts, setEmailAlerts] = useState(profile.notificationPreferences?.emailAlerts ?? true);
  const [sessionReminders, setSessionReminders] = useState(profile.notificationPreferences?.sessionReminders ?? true);
  const [smsAlerts, setSmsAlerts] = useState(profile.notificationPreferences?.smsAlerts ?? false);

  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | undefined>();

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const phoneErr = validatePhone(phone);
    setPhoneError(phoneErr);
    if (phoneErr) {
      onShowToast(phoneErr, 'error');
      return;
    }

    setSaving(true);
    try {
      await onUpdateProfile({
        preferredName: preferredName.trim(),
        phone: phone.trim(),
        alternateEmail: alternateEmail.trim(),
        location: location.trim(),
        bio: bio.trim(),
        skills,
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        notificationPreferences: {
          emailAlerts,
          sessionReminders,
          smsAlerts,
          invitationAlerts: true,
        },
      });
      onShowToast('Personal profile and contact details updated successfully!', 'success');
    } catch {
      onShowToast('Could not save profile changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
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
              Scholar ID: <strong className="text-ink">{profile.studentId}</strong> • {profile.groupCategory}
            </p>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
          className="font-bold text-xs px-6 self-start md:self-auto shrink-0 shadow-sm"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      {/* Official & Locked Details Card */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-charcoal/70" />
              <span>Official Institutional Information</span>
              <span className="rounded bg-charcoal/10 px-2 py-0.5 text-[10px] font-bold text-charcoal">
                Locked
              </span>
            </div>
          }
          subtitle="Assigned role, university, and cohort details are managed exclusively by the Maatram Academic Office."
        />
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-offwhite p-3.5 border border-charcoal/15 text-xs text-charcoal/80">
            <Info className="h-4 w-4 text-charcoal shrink-0 mt-0.5" />
            <p>
              To update your official institutional record (e.g. transfer of branch, grade year, or registration ID), please submit an official request to{' '}
              <strong className="text-ink">academic-office@maatram.dev</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Locked Field: Student Name */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Official Student Name
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-semibold text-ink">{profile.name}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Locked Field: Student ID */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Maatram Scholar ID
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal font-mono">
                <span className="font-semibold text-ink">{profile.studentId}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Locked Field: System Role */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Assigned Role
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-bold text-ink uppercase tracking-wide">Student</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Locked Field: Institution */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Academic Institution
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-medium text-ink truncate">{profile.institution}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40 shrink-0 ml-2" />
              </div>
            </div>

            {/* Locked Field: Department */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Department / Branch
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-medium text-ink">{profile.department}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Locked Field: Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Academic Year
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-medium text-ink">{profile.academicYear}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>

            {/* Locked Field: Group / Category */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Scholar Group & Category
              </label>
              <div className="flex items-center justify-between rounded-lg border border-charcoal/15 bg-charcoal/5 px-3 py-2.5 text-xs text-charcoal">
                <span className="font-medium text-ink">{profile.groupCategory}</span>
                <Lock className="h-3.5 w-3.5 text-charcoal/40" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Personal & Contact Details */}
      <Card>
        <CardHeader
          title="Permitted Personal Details"
          subtitle="Customize your preferred name, contact details, bio, and social links for mentors."
        />
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred First Name"
              type="text"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="e.g. Priya"
              helperText="How coordinators and mentors should address you"
            />

            <Input
              label="Contact Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError(undefined);
              }}
              placeholder="+91 98765 43210"
              error={phoneError}
              icon={<Phone className="h-4 w-4" />}
            />

            <Input
              label="Primary Login Email (Account)"
              type="email"
              value={profile.email}
              disabled
              helperText="Account authentication email"
              icon={<Mail className="h-4 w-4" />}
              className="bg-charcoal/5 cursor-not-allowed"
            />

            <Input
              label="Alternate Personal Email"
              type="email"
              value={alternateEmail}
              onChange={(e) => setAlternateEmail(e.target.value)}
              placeholder="you@gmail.com"
              helperText="Secondary contact for calendar invites"
              icon={<Mail className="h-4 w-4" />}
            />

            <div className="sm:col-span-2">
              <Input
                label="Current City & State"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Chennai, Tamil Nadu"
                icon={<MapPin className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Bio / Introduction */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Professional Bio & Academic Aspirations
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your technical interests, project experiences, and career ambitions…"
              className="w-full rounded-lg border border-charcoal/25 bg-white p-3 text-sm text-ink placeholder:text-charcoal/45 focus:border-ink focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {/* Skills Tag Editor */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Key Technical Skills & Interests
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gold/20 px-2.5 py-1 text-xs font-bold text-ink border border-gold/40"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="rounded-full p-0.5 text-charcoal/60 hover:bg-gold/40 hover:text-ink"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add a skill (e.g. Next.js, Java, ML)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="min-h-10 flex-1 rounded-lg border border-charcoal/25 px-3 text-xs text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddSkill}
                className="text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-charcoal/10">
            <Input
              label="LinkedIn Profile URL"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              icon={<LinkIcon className="h-4 w-4" />}
            />

            <Input
              label="GitHub Profile / Portfolio URL"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              icon={<LinkIcon className="h-4 w-4" />}
            />
          </div>

          {/* Notification Preferences */}
          <div className="pt-2 border-t border-charcoal/10 space-y-3">
            <h4 className="text-sm font-bold text-ink">Notification & Communication Preferences</h4>
            <div className="space-y-2 text-xs text-charcoal">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-charcoal/40 accent-gold"
                />
                <span>Email alerts for newly allotted invitations and mentorship matches</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sessionReminders}
                  onChange={(e) => setSessionReminders(e.target.checked)}
                  className="h-4 w-4 rounded border-charcoal/40 accent-gold"
                />
                <span>Reminder notification 2 hours before every confirmed session</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-charcoal/40 accent-gold"
                />
                <span>SMS alerts for urgent time slot confirmations</span>
              </label>
            </div>
          </div>

          {/* Form Save Action */}
          <div className="pt-4 border-t border-charcoal/10 flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              className="w-full sm:w-auto font-bold text-sm px-8"
            >
              <Save className="h-4 w-4" />
              <span>Save Profile Changes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
