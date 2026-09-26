import React from 'react';
import { Badge } from './Badge';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  UserCheck,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import { ApplicationStatus } from '../../types/application';
import { CertificateStatus } from '../../types/certificate';
import { InstrumentStatus } from '../../types/instrument';

export interface StatusBadgeProps {
  status: ApplicationStatus | CertificateStatus | InstrumentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const iconClass = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  switch (status) {
    /* ── Certificate statuses ── */
    case 'VALID':
      return (
        <Badge variant="mint" size={size} dot>
          <ShieldCheck className={iconClass} />
          Valid
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge variant="amber" size={size} dot>
          <ShieldAlert className={iconClass} />
          Expired
        </Badge>
      );
    case 'REVOKED':
      return (
        <Badge variant="rose" size={size} dot>
          <ShieldX className={iconClass} />
          Revoked
        </Badge>
      );

    /* ── Application statuses ── */
    case 'Pending':
      return (
        <Badge variant="amber" size={size} dot>
          <Clock className={iconClass} />
          Pending
        </Badge>
      );
    case 'Assigned':
      return (
        <Badge variant="purple" size={size} dot>
          <UserCheck className={iconClass} />
          Officer Assigned
        </Badge>
      );
    case 'Inspection Scheduled':
      return (
        <Badge variant="blue" size={size} dot>
          <Calendar className={iconClass} />
          Scheduled
        </Badge>
      );
    case 'Inspection Completed':
      return (
        <Badge variant="purple" size={size} dot>
          <FileCheck className={iconClass} />
          Inspection Done
        </Badge>
      );
    case 'Approved':
      return (
        <Badge variant="mint" size={size} dot>
          <CheckCircle2 className={iconClass} />
          Approved
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge variant="rose" size={size} dot>
          <XCircle className={iconClass} />
          Rejected
        </Badge>
      );

    /* ── Instrument statuses ── */
    case 'Active':
      return (
        <Badge variant="mint" size={size} dot>
          <CheckCircle2 className={iconClass} />
          Active
        </Badge>
      );
    case 'Under Verification':
      return (
        <Badge variant="blue" size={size} dot>
          <Clock className={iconClass} />
          Under Verification
        </Badge>
      );
    case 'Pending Re-verification':
      return (
        <Badge variant="amber" size={size} dot>
          <AlertTriangle className={iconClass} />
          Re-verification Due
        </Badge>
      );

    /* ── Inspection results ── */
    case 'PASS':
      return (
        <Badge variant="mint" size={size} dot>
          <CheckCircle2 className={iconClass} />
          Pass
        </Badge>
      );
    case 'FAIL':
      return (
        <Badge variant="rose" size={size} dot>
          <XCircle className={iconClass} />
          Fail
        </Badge>
      );
    case 'REQUIRES REINSPECTION':
      return (
        <Badge variant="amber" size={size} dot>
          <AlertTriangle className={iconClass} />
          Reinspection Req.
        </Badge>
      );

    default:
      return (
        <Badge variant="neutral" size={size} dot>
          {status}
        </Badge>
      );
  }
};
