import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import type {
  AdminStudentItem,
  BulkImportRow,
  BulkImportSummary,
  InstitutionItem,
} from '../../types/admin';
import { adminService } from '../../services/admin/adminService';
import { DEPARTMENTS_LIST } from '../../services/office/mockOfficeData';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface StudentRegistrationTabProps {
  institutions: InstitutionItem[];
  onStudentRegistered: (student: AdminStudentItem) => void;
  onBulkImportCompleted: (count: number) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateTab: (tab: any) => void;
}

export function StudentRegistrationTab({
  institutions,
  onStudentRegistered,
  onBulkImportCompleted,
  onShowToast,
  onNavigateTab,
}: StudentRegistrationTabProps) {
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');

  // Single Registration Form State
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState(institutions[0]?.name || 'College of Engineering, Guindy');
  const [academicYear, setAcademicYear] = useState<AdminStudentItem['academicYear']>('3rd Year');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [location, setLocation] = useState('Chennai, Tamil Nadu');

  const [savingSingle, setSavingSingle] = useState(false);
  const [formError, setFormError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState<AdminStudentItem | null>(null);

  // Bulk Import State
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<BulkImportRow[]>([]);
  const [importSummary, setImportSummary] = useState<BulkImportSummary | null>(null);
  const [importing, setImporting] = useState(false);

  // Auto-generate next Student ID helper
  const handleGenerateId = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setStudentId(`MS-2024-${randomNum}`);
    setFormError('');
  };

  // Submit single student registration
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setRegisteredSuccess(null);
    setSavingSingle(true);

    try {
      const newStudent = await adminService.registerStudent({
        name,
        email,
        phone,
        institution,
        academicYear,
        department,
        studentId,
        location,
      });

      onStudentRegistered(newStudent);
      setRegisteredSuccess(newStudent);
      onShowToast(`Scholar ${newStudent.name} registered successfully with Student role!`, 'success');

      // Reset form
      setName('');
      setStudentId('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed.');
      onShowToast(err.message || 'Failed to register student', 'error');
    } finally {
      setSavingSingle(false);
    }
  };

  // Sample CSV format
  const sampleCsvData = `name,email,phone,institution,department,academicYear,studentId
Suresh Venkat,suresh.v@maatram.dev,+91 9840123456,College of Engineering Guindy,Computer Science & Engineering,3rd Year,MS-2024-801
Kavya Sundaram,kavya.s@maatram.dev,+91 9840123457,Madras Institute of Technology,Information Technology,2nd Year,MS-2024-802
Ranjith Kumar,ranjith.k@maatram.dev,+91 9840123458,PSG College of Technology,Mechanical Engineering,4th Year,MS-2024-803
Priya Dharshini K,student@maatram.dev,+91 9876543210,College of Engineering Guindy,Computer Science & Engineering,3rd Year,MS-2024-001
Invalid Scholar,invalid-email,12345,CIT,,3rd Year,MS-2024-805`;

  const handleLoadSampleCsv = () => {
    setCsvText(sampleCsvData);
    handleParseCsv(sampleCsvData);
  };

  // Parse CSV text and validate rows
  const handleParseCsv = (rawText: string) => {
    if (!rawText.trim()) {
      setParsedRows([]);
      setImportSummary(null);
      return;
    }

    const lines = rawText.trim().split('\n');
    if (lines.length < 2) {
      onShowToast('CSV must include header row and data rows', 'error');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rawRows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const rowObj: any = {};
      headers.forEach((h, i) => {
        rowObj[h] = values[i] || '';
      });
      return rowObj;
    });

    const validation = adminService.validateBulkImport(rawRows);
    setParsedRows(validation.rows);
    setImportSummary(validation.summary);
  };

  // Execute bulk import
  const handleExecuteBulk = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      onShowToast('No valid rows found to import', 'error');
      return;
    }

    setImporting(true);
    try {
      const res = await adminService.executeBulkImport(validRows);
      onBulkImportCompleted(res.importedCount);
      onShowToast(`Successfully imported ${res.importedCount} scholars into directory!`, 'success');
      setCsvText('');
      setParsedRows([]);
      setImportSummary(null);
    } catch (err: any) {
      onShowToast(err.message || 'Bulk import failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  const departmentsList = DEPARTMENTS_LIST;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-gold/25 px-2.5 py-0.5 text-xs font-bold text-ink uppercase">
              Core Authority
            </span>
            <span className="text-xs text-charcoal/60 font-medium">Automatic Student Role Assignment</span>
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-ink sm:text-2xl">
            Scholar Registration & Enrollment
          </h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Enroll scholars individually or import bulk student rosters via CSV with strict duplicate prevention.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center rounded-xl bg-offwhite p-1 border border-charcoal/15 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('single')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeMode === 'single'
                ? 'bg-ink text-white shadow-xs'
                : 'text-charcoal hover:text-ink'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Single Registration</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('bulk')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeMode === 'bulk'
                ? 'bg-ink text-white shadow-xs'
                : 'text-charcoal hover:text-ink'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Bulk CSV Import</span>
          </button>
        </div>
      </div>

      {/* SINGLE SCHOLAR REGISTRATION MODE */}
      {activeMode === 'single' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-gold" />
                  <span>Individual Scholar Registration Form</span>
                </div>
              }
              subtitle="Enforces verified scholar data and automatically assigns Student role privileges"
            />
            <CardContent>
              {/* Role Guard Notice Banner */}
              <div className="mb-6 rounded-xl bg-offwhite p-3.5 border border-charcoal/15 flex items-start gap-2.5 text-xs text-charcoal">
                <ShieldCheck className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Role Isolation Enforced:</strong> Accounts registered through this form are automatically designated with the <code>student</code> role. Office Team and Administrative privileges cannot be assigned here to maintain security boundaries.
                </p>
              </div>

              {formError && (
                <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-xs text-red-900 animate-in fade-in">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">Registration Blocked:</strong>
                    <span>{formError}</span>
                  </div>
                </div>
              )}

              {registeredSuccess && (
                <div className="mb-6 rounded-xl bg-emerald-50 p-4 border border-emerald-200 flex items-start justify-between gap-3 text-xs text-emerald-950 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-bold block">
                        Scholar Registered Successfully!
                      </strong>
                      <p className="mt-0.5 leading-relaxed">
                        <strong>{registeredSuccess.name}</strong> ({registeredSuccess.studentId}) is now active in the Student Directory for <strong>{registeredSuccess.institution}</strong>.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateTab('students')}
                    className="shrink-0 text-xs font-bold"
                  >
                    View in Directory
                  </Button>
                </div>
              )}

              <form onSubmit={handleSingleSubmit} className="space-y-5 text-xs text-charcoal">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <Input
                      label="Full Student Name"
                      placeholder="e.g. Priya Dharshini K"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setFormError('');
                      }}
                      required
                    />
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1.5 flex items-center justify-between">
                      <span>Student ID / Reg. No.</span>
                      <button
                        type="button"
                        onClick={handleGenerateId}
                        className="text-[10px] text-ink font-bold hover:text-gold flex items-center gap-1"
                      >
                        <Sparkles className="h-2.5 w-2.5" /> Auto-Suggest
                      </button>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MS-2024-071"
                      value={studentId}
                      onChange={(e) => {
                        setStudentId(e.target.value);
                        setFormError('');
                      }}
                      required
                      className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink font-mono focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Input
                      label="Student Email Address"
                      type="email"
                      placeholder="student@maatram.dev"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFormError('');
                      }}
                      icon={<Mail className="h-4 w-4" />}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Input
                      label="Contact Phone Number"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setFormError('');
                      }}
                      icon={<Phone className="h-4 w-4" />}
                      required
                    />
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1.5">
                      Engineering Institution
                    </label>
                    <select
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.name}>
                          {inst.name} ({inst.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1.5">
                      Academic Year
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value as AdminStudentItem['academicYear'])}
                      className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      <option value="1st Year">1st Year (Freshmen)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Pre-Final)</option>
                      <option value="4th Year">4th Year (Graduating)</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-charcoal mb-1.5">
                      Department / Branch
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div className="sm:col-span-2">
                    <Input
                      label="Location / Native District"
                      placeholder="Chennai, Tamil Nadu"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-charcoal/10 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setName('');
                      setStudentId('');
                      setEmail('');
                      setPhone('');
                      setFormError('');
                    }}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={savingSingle}
                    className="font-bold text-xs px-8"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Complete Scholar Registration</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BULK CSV IMPORT MODE */}
      {activeMode === 'bulk' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-gold" />
                  <span>Bulk Scholar CSV Registration</span>
                </div>
              }
              subtitle="Upload or paste student roster CSV with automatic duplicate ID and email detection"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSampleCsv}
                  className="text-xs font-bold"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Load Sample CSV Test Data</span>
                </Button>
              }
            />
            <CardContent className="space-y-5">
              {/* CSV Input Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-ink">
                    Paste CSV Data (or load sample above):
                  </label>
                  <span className="text-[10px] text-charcoal/60 font-mono">
                    Required headers: name, email, phone, institution, department, academicYear, studentId
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    handleParseCsv(e.target.value);
                  }}
                  placeholder="name,email,phone,institution,department,academicYear,studentId&#10;Priya Dharshini K,priya@maatram.dev,+91 9840123456,CEG,CSE,3rd Year,MS-2024-901"
                  className="w-full rounded-xl border border-charcoal/25 bg-white p-3 font-mono text-xs text-ink placeholder:text-charcoal/40 focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              {/* Import Summary Bar */}
              {importSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-offwhite p-4 border border-charcoal/15 text-xs text-charcoal">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-charcoal/50 block">
                      Rows Evaluated
                    </span>
                    <span className="text-xl font-extrabold text-ink">
                      {importSummary.totalRows}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                      Valid for Import
                    </span>
                    <span className="text-xl font-extrabold text-emerald-700">
                      {importSummary.validRows}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-700 block">
                      Flagged / Invalid
                    </span>
                    <span className="text-xl font-extrabold text-red-600">
                      {importSummary.invalidRows}
                    </span>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      variant="primary"
                      size="md"
                      loading={importing}
                      onClick={handleExecuteBulk}
                      disabled={importSummary.validRows === 0}
                      className="font-bold text-xs"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Import {importSummary.validRows} Valid Scholars</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Parsed Rows Preview Table */}
              {parsedRows.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-charcoal/15 bg-white shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-charcoal/15 bg-offwhite/80 text-[11px] font-bold uppercase text-charcoal/70">
                        <th className="py-2.5 pl-4 pr-2">Row</th>
                        <th className="py-2.5 px-2">Scholar Name & ID</th>
                        <th className="py-2.5 px-2">Email</th>
                        <th className="py-2.5 px-2">Institution & Dept</th>
                        <th className="py-2.5 px-2">Validation Status</th>
                        <th className="py-2.5 pr-4 text-right">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/10">
                      {parsedRows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={row.isValid ? 'hover:bg-offwhite/40' : 'bg-red-50/50'}
                        >
                          <td className="py-2.5 pl-4 pr-2 font-mono text-charcoal/60">
                            #{row.rowNumber}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="font-bold text-ink block">{row.name || '—'}</span>
                            <span className="font-mono text-[10px] text-charcoal/60 block">
                              {row.studentId || 'No ID'}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-mono text-[11px]">
                            {row.email || '—'}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="font-medium text-ink block">{row.institution || '—'}</span>
                            <span className="text-[10px] text-charcoal/60 block">{row.department || '—'}</span>
                          </td>
                          <td className="py-2.5 px-2">
                            {row.isValid ? (
                              <Badge variant="success" size="sm" dot>
                                Valid Record
                              </Badge>
                            ) : (
                              <Badge variant="warning" size="sm">
                                Flagged
                              </Badge>
                            )}
                          </td>
                          <td className="py-2.5 pr-4 text-right">
                            {row.isValid ? (
                              <span className="text-emerald-700 text-[11px] font-semibold">
                                Ready for import
                              </span>
                            ) : (
                              <span className="text-red-700 text-[11px] font-semibold">
                                {row.errors.join(' • ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
