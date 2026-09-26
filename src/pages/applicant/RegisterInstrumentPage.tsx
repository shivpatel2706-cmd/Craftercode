import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { instrumentService } from '../../services/instrumentService';
import { applicationService } from '../../services/applicationService';
import { InstrumentType, AccuracyClass, PurposeOfUse } from '../../types/instrument';
import { 
  Scale, 
  Upload, 
  CheckCircle2, 
  FileText, 
  Image, 
  ArrowLeft, 
  Save, 
  Send,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';

export const RegisterInstrumentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, info } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);

  // Form State
  const [ownerName, setOwnerName] = useState(user?.name || 'Rajesh Sharma');
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || '+91 98765 43210');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || 'applicant@metroverify.gov.in');
  const [ownerAddress, setOwnerAddress] = useState(user?.address || 'Plot 44-B, MIDC Industrial Area, Phase II, New Delhi - 110020');

  // Instrument Details
  const [instrumentName, setInstrumentName] = useState('Digital Industrial Platform Scale');
  const [instrumentType, setInstrumentType] = useState<InstrumentType>('Platform Scale');
  const [manufacturer, setManufacturer] = useState('Essae-Teraoka Pvt Ltd');
  const [modelNumber, setModelNumber] = useState('DS-415 High Precision');
  const [serialNumber, setSerialNumber] = useState(`ESS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [capacity, setCapacity] = useState('300 kg x 20 g');
  const [accuracyClass, setAccuracyClass] = useState<AccuracyClass>('Class III (Medium)');
  const [yearOfManufacture, setYearOfManufacture] = useState(new Date().getFullYear());
  const [installationLocation, setInstallationLocation] = useState('Warehouse Bay 4, Loading Ramp Section');
  const [purposeOfUse, setPurposeOfUse] = useState<PurposeOfUse>('Commercial Retail');

  // Additional fields
  const [previousCertificateNumber, setPreviousCertificateNumber] = useState('');
  const [previousVerificationDate, setPreviousVerificationDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Upload state indicators
  const [prevCertFile, setPrevCertFile] = useState<string>('previous_statutory_cert_2025.pdf');
  const [invoiceFile, setInvoiceFile] = useState<string>('tax_invoice_tax_paid.pdf');
  const [photoFile, setPhotoFile] = useState<string>('instrument_plate_front.jpg');
  const [otherDocFile, setOtherDocFile] = useState<string>('');

  const instrumentTypes: { value: InstrumentType; label: string }[] = [
    { value: 'Non-Automatic Weighing Instrument (NAWI)', label: 'Non-Automatic Weighing Instrument (NAWI)' },
    { value: 'Electronic Balance / Bench Scale', label: 'Electronic Balance / Bench Scale' },
    { value: 'Electronic Weighbridge', label: 'Electronic Weighbridge (Pit / Pitless)' },
    { value: 'Fuel Dispenser (MPD)', label: 'Fuel Dispenser (MPD / Petrol / Diesel)' },
    { value: 'Platform Scale', label: 'Platform Scale (Heavy / Commercial)' },
    { value: 'Automatic Catchweigher', label: 'Automatic Catchweigher / Checkweigher' },
    { value: 'Storage Tank Meter', label: 'Storage Tank Level Gauge & Flow Meter' },
    { value: 'Length & Linear Measure', label: 'Length & Linear Measure / Fabric Meter' },
  ];

  const accuracyClasses: { value: AccuracyClass; label: string }[] = [
    { value: 'Class I (Special)', label: 'Class I (Special Accuracy - Analytical Labs)' },
    { value: 'Class II (High)', label: 'Class II (High Accuracy - Gold & Gems / Pharma)' },
    { value: 'Class III (Medium)', label: 'Class III (Medium Accuracy - Commercial / Weighbridge)' },
    { value: 'Class IV (Ordinary)', label: 'Class IV (Ordinary Accuracy - Bulk Scrap / Coal)' },
  ];

  const purposeOptions: { value: PurposeOfUse; label: string }[] = [
    { value: 'Commercial Retail', label: 'Commercial Retail & Wholesale Trading' },
    { value: 'Industrial Logistics', label: 'Industrial Logistics & Freight Weighing' },
    { value: 'Healthcare / Pharma', label: 'Healthcare, Clinical & Pharma Manufacturing' },
    { value: 'Gold & Precious Metals', label: 'Gold, Bullion & Precious Gem Stones' },
    { value: 'Petroleum & Gas', label: 'Petroleum, Hydrocarbons & Retail Fuel' },
    { value: 'Agriculture', label: 'Agricultural APMC Mandi Procurement' },
  ];

  const handleSaveDraft = () => {
    info('Form data saved to local draft cache.', 'Draft Preserved');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create Instrument
      const inst = await instrumentService.createInstrument({
        name: instrumentName,
        type: instrumentType,
        manufacturer,
        modelNumber,
        serialNumber,
        capacity,
        accuracyClass,
        yearOfManufacture: Number(yearOfManufacture),
        installationLocation,
        purposeOfUse,
        ownerId: user?.id || 'usr_applicant_1',
        ownerName,
        ownerPhone,
        ownerEmail,
        ownerAddress,
        previousCertificateNumber: previousCertificateNumber || undefined,
        previousVerificationDate: previousVerificationDate || undefined,
        expiryDate: expiryDate || undefined,
        status: 'Under Verification',
        documents: {
          previousCertificateUrl: prevCertFile || undefined,
          purchaseInvoiceUrl: invoiceFile || undefined,
          instrumentPhotoUrl: photoFile || undefined,
          supportingDocUrl: otherDocFile || undefined,
        }
      });

      // 2. Submit Verification Application
      const app = await applicationService.createApplication({
        instrumentId: inst.id,
        instrumentName: inst.name,
        instrumentType: inst.type,
        serialNumber: inst.serialNumber,
        capacity: inst.capacity,
        location: inst.installationLocation,
        ownerId: inst.ownerId,
        ownerName: inst.ownerName,
        ownerPhone: inst.ownerPhone,
        ownerEmail: inst.ownerEmail,
        priority: 'Normal',
        feeAmount: 1250,
      });

      setCreatedAppId(app.id);
      success('Instrument registered successfully.', 'Application Submitted');
    } catch (err: any) {
      alert('Error creating application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-mono text-slate-400">Statutory Form LM-1</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="border-b border-slate-100 pb-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Register Instrument &amp; Apply for Verification
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory registration under Legal Metrology Act 2009 for initial verification or renewal stamping.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Instrument Owner Details */}
          <div>
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-blue-600" />
              1. Instrument Owner / Enterprise Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner / Enterprise Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
              <Input
                label="Mobile Number"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                required
              />
              <Input
                label="Official Email"
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
              />
              <Input
                label="Registered Business Address"
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 2: Instrument Details */}
          <div>
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Scale className="w-4 h-4 text-blue-600" />
              2. Instrument Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Instrument Name"
                value={instrumentName}
                onChange={(e) => setInstrumentName(e.target.value)}
                required
              />
              <Select
                label="Instrument Type / Category"
                value={instrumentType}
                onChange={(e) => setInstrumentType(e.target.value as InstrumentType)}
                options={instrumentTypes}
                required
              />
              <Input
                label="Manufacturer Name"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                required
              />
              <Input
                label="Model Number"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                required
              />
              <Input
                label="Serial Number / Machine ID"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
              />
              <Input
                label="Capacity & Division (e.g. 150 kg x 10 g)"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
              <Select
                label="Accuracy Class"
                value={accuracyClass}
                onChange={(e) => setAccuracyClass(e.target.value as AccuracyClass)}
                options={accuracyClasses}
                required
              />
              <Input
                label="Year of Manufacture"
                type="number"
                value={yearOfManufacture}
                onChange={(e) => setYearOfManufacture(Number(e.target.value))}
                min={1990}
                max={2030}
                required
              />
              <Select
                label="Purpose of Use"
                value={purposeOfUse}
                onChange={(e) => setPurposeOfUse(e.target.value as PurposeOfUse)}
                options={purposeOptions}
                required
              />
              <Input
                label="Installation Location (Factory / Shop / Island)"
                value={installationLocation}
                onChange={(e) => setInstallationLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 3: Previous Verification Details (Optional / Re-verification) */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              3. Previous Verification Details (If Re-verification)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Previous Certificate Number"
                value={previousCertificateNumber}
                onChange={(e) => setPreviousCertificateNumber(e.target.value)}
                placeholder="e.g. MV-CERT-2025-4122"
              />
              <Input
                label="Previous Verification Date"
                type="date"
                value={previousVerificationDate}
                onChange={(e) => setPreviousVerificationDate(e.target.value)}
              />
              <Input
                label="Expiry Date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Section 4: Document Uploads */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Upload className="w-4 h-4 text-slate-500" />
              4. Mandatory Statutory Document Uploads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Previous Certificate */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100/60 transition-colors">
                <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <label className="text-xs font-bold text-slate-700 block">
                  Previous Verification Certificate
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">PDF or Scanned Copy (Max 5MB)</p>
                <div className="mt-2 text-xs font-mono text-blue-700 bg-white border border-slate-200 py-1 px-2 rounded inline-block">
                  {prevCertFile || 'No file selected'}
                </div>
              </div>

              {/* Purchase Invoice */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100/60 transition-colors">
                <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <label className="text-xs font-bold text-slate-700 block">
                  Purchase Invoice / Bill of Sale
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">Proof of Legal Acquisition</p>
                <div className="mt-2 text-xs font-mono text-blue-700 bg-white border border-slate-200 py-1 px-2 rounded inline-block">
                  {invoiceFile || 'No file selected'}
                </div>
              </div>

              {/* Instrument Photograph */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100/60 transition-colors">
                <Image className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <label className="text-xs font-bold text-slate-700 block">
                  Instrument Nameplate &amp; Physical Photo
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">Clear photo showing serial number</p>
                <div className="mt-2 text-xs font-mono text-blue-700 bg-white border border-slate-200 py-1 px-2 rounded inline-block">
                  {photoFile || 'No file selected'}
                </div>
              </div>

              {/* Other Document */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100/60 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <label className="text-xs font-bold text-slate-700 block">
                  Other Supporting Document (Optional)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">Model Approval / Calibration report</p>
                <div className="mt-2 text-xs font-mono text-slate-500 bg-white border border-slate-200 py-1 px-2 rounded inline-block">
                  {otherDocFile || 'Optional attachment'}
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/applicant/dashboard')}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                icon={<Save className="w-4 h-4" />}
                className="flex-1 sm:flex-none"
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                icon={<Send className="w-4 h-4" />}
                className="flex-1 sm:flex-none font-bold"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={!!createdAppId}
        onClose={() => navigate(`/applicant/tracking?appId=${createdAppId}`)}
        title="Instrument Registered Successfully"
        subtitle="Statutory Verification Application Filed"
        maxWidth="md"
        footer={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/applicant/tracking?appId=${createdAppId}`)}
            className="w-full font-bold"
          >
            Track Application Live
          </Button>
        }
      >
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            Application Reference Number
          </p>
          <div className="mt-1 font-mono text-2xl font-black text-blue-800">
            {createdAppId}
          </div>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed max-w-sm mx-auto">
            Your instrument and verification filing have been recorded. 
            The Legal Metrology desk will scrutinize the documents and designate a field verification officer.
          </p>
        </div>
      </Modal>
    </div>
  );
};
