using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MetroVerify360.Helpers;
using MetroVerify360.Models;

namespace MetroVerify360.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(MetroVerifyDbContext context)
        {
            // Seed Users if not present
            if (!await context.Users.AnyAsync())
            {
                var admin = new User
                {
                    Id = "usr_admin_1",
                    Name = "Dr. A. Ramanathan",
                    Email = "admin@metroverify.gov.in",
                    PasswordHash = PasswordHasher.HashPassword("Metro@123"),
                    Role = UserRole.Admin,
                    Phone = "+91 99000 11223",
                    Organization = "Ministry of Consumer Affairs & Legal Metrology",
                    Designation = "Controller & Chief Verification Officer",
                    BadgeNumber = "CLM-HQ-001",
                    JurisdictionZone = "National Jurisdiction / All Zones",
                    Address = "Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001",
                    AvatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6)
                };

                var officer = new User
                {
                    Id = "usr_officer_1",
                    Name = "Inspector S. K. Verma",
                    Email = "officer@metroverify.gov.in",
                    PasswordHash = PasswordHasher.HashPassword("Metro@123"),
                    Role = UserRole.Officer,
                    Phone = "+91 98111 22334",
                    Organization = "Directorate of Legal Metrology",
                    Designation = "Senior Legal Metrology Inspector",
                    BadgeNumber = "LMI-DL-2018-044",
                    JurisdictionZone = "North & Central Delhi Zone 2",
                    Address = "Legal Metrology Bhawan, ITO, New Delhi - 110002",
                    AvatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6)
                };

                var applicant = new User
                {
                    Id = "usr_applicant_1",
                    Name = "Rajesh Sharma",
                    Email = "applicant@metroverify.gov.in",
                    PasswordHash = PasswordHasher.HashPassword("Metro@123"),
                    Role = UserRole.Applicant,
                    Phone = "+91 98765 43210",
                    Organization = "Apex Agro & Logistics Hub Ltd",
                    Designation = "Managing Director & Authorized Signatory",
                    Address = "Plot 44-B, MIDC Industrial Area, Phase II, New Delhi - 110020",
                    AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6)
                };

                await context.Users.AddRangeAsync(admin, officer, applicant);
                await context.SaveChangesAsync();

                // Seed Instruments
                var inst1 = new Instrument
                {
                    Id = "INST-2026-001",
                    OwnerId = applicant.Id,
                    InstrumentName = "Heavy Duty Pitless Electronic Weighbridge",
                    InstrumentType = "Electronic Weighbridge",
                    Manufacturer = "Avery Weigh-Tronix India Pvt Ltd",
                    ModelNumber = "BridgeMaster Pro-60T",
                    SerialNumber = "AWT-WB-2023-9981",
                    Capacity = "60,000 kg x 10 kg",
                    AccuracyClass = "Class III (Medium)",
                    YearOfManufacture = 2023,
                    InstallationLocation = "Main Gate Weigh Station, Plot 44-B, MIDC Industrial Area, Phase II, New Delhi",
                    PurposeOfUse = "Industrial Logistics",
                    PreviousCertificateNumber = "MV-CERT-2025-4122",
                    PreviousVerificationDate = DateTime.UtcNow.AddYears(-1),
                    ExpiryDate = DateTime.UtcNow.AddDays(18),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddMonths(-5),
                    UpdatedAt = DateTime.UtcNow
                };

                var inst2 = new Instrument
                {
                    Id = "INST-2026-002",
                    OwnerId = applicant.Id,
                    InstrumentName = "High Precision Analytical Gold & Gem Balance",
                    InstrumentType = "Non-Automatic Weighing Instrument (NAWI)",
                    Manufacturer = "Sartorius Lab Instruments GmbH",
                    ModelNumber = "Secura 224-1S",
                    SerialNumber = "SAR-SEC-2024-4412",
                    Capacity = "220 g x 0.1 mg",
                    AccuracyClass = "Class I (Special)",
                    YearOfManufacture = 2024,
                    InstallationLocation = "Bullion Vault Assay Lab, Connaught Place, New Delhi",
                    PurposeOfUse = "Gold & Precious Metals",
                    PreviousCertificateNumber = "CERT-2026-000001",
                    PreviousVerificationDate = DateTime.UtcNow.AddMonths(-3),
                    ExpiryDate = DateTime.UtcNow.AddMonths(9),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddMonths(-4),
                    UpdatedAt = DateTime.UtcNow
                };

                var inst3 = new Instrument
                {
                    Id = "INST-2026-003",
                    OwnerId = applicant.Id,
                    InstrumentName = "Multi-Product Electronic Fuel Dispenser",
                    InstrumentType = "Fuel Dispenser (MPD)",
                    Manufacturer = "Gilbarco Veeder-Root India",
                    ModelNumber = "Horizon 4-Hose High Flow",
                    SerialNumber = "GVR-MPD-2024-8871",
                    Capacity = "50 L/min (Accuracy +/- 0.3%)",
                    AccuracyClass = "Class III (Medium)",
                    YearOfManufacture = 2024,
                    InstallationLocation = "Island #3, Highway Retail Fuel Station, NH-48 Express Corridor",
                    PurposeOfUse = "Petroleum & Gas",
                    Status = "Under Verification",
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow
                };

                var inst4 = new Instrument
                {
                    Id = "INST-2026-004",
                    OwnerId = applicant.Id,
                    InstrumentName = "Stainless Steel Commercial Platform Scale",
                    InstrumentType = "Platform Scale",
                    Manufacturer = "Essae-Teraoka Pvt Ltd",
                    ModelNumber = "DS-215 Waterproof Platform",
                    SerialNumber = "ESS-DS215-2025-331",
                    Capacity = "150 kg x 10 g",
                    AccuracyClass = "Class III (Medium)",
                    YearOfManufacture = 2025,
                    InstallationLocation = "Packaging Dock Section A, Warehouse 3, New Delhi",
                    PurposeOfUse = "Commercial Retail",
                    Status = "Under Verification",
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    UpdatedAt = DateTime.UtcNow
                };

                await context.Instruments.AddRangeAsync(inst1, inst2, inst3, inst4);
                await context.SaveChangesAsync();

                // Seed Application 1 (Approved & Certificate Generated)
                var app1 = new Application
                {
                    Id = "APP-2026-0839",
                    ApplicationNumber = "APP-2026-0839",
                    InstrumentId = inst2.Id,
                    OwnerId = applicant.Id,
                    Status = ApplicationStatuses.Approved,
                    Priority = "Normal",
                    FeeAmount = 1500.00m,
                    PaymentStatus = "Paid",
                    ApplicationDate = DateTime.UtcNow.AddMonths(-3),
                    ScheduledInspectionDate = DateTime.UtcNow.AddMonths(-3).AddDays(3),
                    CompletedDate = DateTime.UtcNow.AddMonths(-3).AddDays(4),
                    ApprovalDate = DateTime.UtcNow.AddMonths(-3).AddDays(5),
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow.AddMonths(-3).AddDays(5)
                };

                // Seed Application 2 (Inspection Completed - Pending Digital Approval)
                var app2 = new Application
                {
                    Id = "APP-2026-0840",
                    ApplicationNumber = "APP-2026-0840",
                    InstrumentId = inst3.Id,
                    OwnerId = applicant.Id,
                    Status = ApplicationStatuses.InspectionCompleted,
                    Priority = "High",
                    FeeAmount = 2000.00m,
                    PaymentStatus = "Paid",
                    ApplicationDate = DateTime.UtcNow.AddDays(-12),
                    ScheduledInspectionDate = DateTime.UtcNow.AddDays(-4),
                    CompletedDate = DateTime.UtcNow.AddDays(-3),
                    CreatedAt = DateTime.UtcNow.AddDays(-12),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                };

                // Seed Application 3 (Inspection Scheduled)
                var app3 = new Application
                {
                    Id = "APP-2026-0841",
                    ApplicationNumber = "APP-2026-0841",
                    InstrumentId = inst1.Id,
                    OwnerId = applicant.Id,
                    Status = ApplicationStatuses.InspectionScheduled,
                    Priority = "High",
                    FeeAmount = 4500.00m,
                    PaymentStatus = "Paid",
                    ApplicationDate = DateTime.UtcNow.AddDays(-7),
                    ScheduledInspectionDate = DateTime.UtcNow.AddDays(2),
                    CreatedAt = DateTime.UtcNow.AddDays(-7),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                };

                // Seed Application 4 (Submitted / Pending Review)
                var app4 = new Application
                {
                    Id = "APP-2026-0842",
                    ApplicationNumber = "APP-2026-0842",
                    InstrumentId = inst4.Id,
                    OwnerId = applicant.Id,
                    Status = ApplicationStatuses.Submitted,
                    Priority = "Normal",
                    FeeAmount = 750.00m,
                    PaymentStatus = "Paid",
                    ApplicationDate = DateTime.UtcNow.AddDays(-3),
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                };

                var appLegacy1 = new Application
                {
                    Id = "APP-2024-0109",
                    ApplicationNumber = "APP-2024-0109",
                    InstrumentId = inst1.Id,
                    OwnerId = applicant.Id,
                    Status = ApplicationStatuses.Approved,
                    Priority = "Normal",
                    FeeAmount = 4000.00m,
                    PaymentStatus = "Paid",
                    ApplicationDate = DateTime.UtcNow.AddYears(-2),
                    CompletedDate = DateTime.UtcNow.AddYears(-2),
                    ApprovalDate = DateTime.UtcNow.AddYears(-2),
                    CreatedAt = DateTime.UtcNow.AddYears(-2),
                    UpdatedAt = DateTime.UtcNow.AddYears(-2)
                };

                var appLegacy2 = new Application
                {
                    Id = "APP-2024-0081",
                    ApplicationNumber = "APP-2024-0081",
                    InstrumentId = inst3.Id,
                    OwnerId = applicant.Id,
                    Status = ApplicationStatuses.Approved,
                    Priority = "Normal",
                    FeeAmount = 1800.00m,
                    PaymentStatus = "Paid",
                    ApplicationDate = DateTime.UtcNow.AddYears(-2),
                    CompletedDate = DateTime.UtcNow.AddYears(-2),
                    ApprovalDate = DateTime.UtcNow.AddYears(-2),
                    CreatedAt = DateTime.UtcNow.AddYears(-2),
                    UpdatedAt = DateTime.UtcNow.AddYears(-2)
                };

                await context.Applications.AddRangeAsync(app1, app2, app3, app4, appLegacy1, appLegacy2);
                await context.SaveChangesAsync();

                // Seed Officer Assignments
                var assign1 = new OfficerAssignment
                {
                    Id = Guid.NewGuid().ToString(),
                    ApplicationId = app1.Id,
                    OfficerId = officer.Id,
                    AssignedDate = DateTime.UtcNow.AddMonths(-3).AddDays(1),
                    ScheduledInspectionDate = app1.ScheduledInspectionDate,
                    Location = inst2.InstallationLocation,
                    Status = "Completed"
                };

                var assign2 = new OfficerAssignment
                {
                    Id = Guid.NewGuid().ToString(),
                    ApplicationId = app2.Id,
                    OfficerId = officer.Id,
                    AssignedDate = DateTime.UtcNow.AddDays(-10),
                    ScheduledInspectionDate = app2.ScheduledInspectionDate,
                    Location = inst3.InstallationLocation,
                    Status = "Completed"
                };

                var assign3 = new OfficerAssignment
                {
                    Id = Guid.NewGuid().ToString(),
                    ApplicationId = app3.Id,
                    OfficerId = officer.Id,
                    AssignedDate = DateTime.UtcNow.AddDays(-5),
                    ScheduledInspectionDate = app3.ScheduledInspectionDate,
                    Location = inst1.InstallationLocation,
                    Status = "Active"
                };

                await context.OfficerAssignments.AddRangeAsync(assign1, assign2, assign3);
                await context.SaveChangesAsync();

                // Seed Inspections
                var insp1 = new Inspection
                {
                    Id = "INSP-2026-001",
                    ApplicationId = app1.Id,
                    OfficerId = officer.Id,
                    InspectionDate = app1.CompletedDate ?? DateTime.UtcNow.AddMonths(-3).AddDays(4),
                    InstrumentCondition = "Excellent",
                    ManufacturerVerified = true,
                    SerialNumberVerified = true,
                    SealCondition = "Intact",
                    DisplayCondition = "Clear & Readable",
                    AccuracyResult = "Pass",
                    ZeroError = "0.0000 g",
                    RepeatabilityResult = "Satisfactory (Range < 1 e)",
                    ReferenceStandard = "Class E2 Standard Weights Set (NPL Traceable)",
                    ObservedMeasurement = "200.0001 g on 200.0000 g Standard",
                    PermissibleError = "+/- 0.5 mg (Class I MPE)",
                    Result = "PASS",
                    Remarks = "Air draft shield intact. Anti-vibration table verified. Instrument passed all metrological tests.",
                    LeadSealTagNumber = "DL-LM-SEAL-77914",
                    Status = "Completed"
                };

                var insp2 = new Inspection
                {
                    Id = "INSP-2026-002",
                    ApplicationId = app2.Id,
                    OfficerId = officer.Id,
                    InspectionDate = app2.CompletedDate ?? DateTime.UtcNow.AddDays(-3),
                    InstrumentCondition = "Good",
                    ManufacturerVerified = true,
                    SerialNumberVerified = true,
                    SealCondition = "Intact",
                    DisplayCondition = "Clear & Readable",
                    AccuracyResult = "Pass",
                    ZeroError = "0.00 Litres at cut-off valve",
                    RepeatabilityResult = "Satisfactory (Range < 1 e)",
                    ReferenceStandard = "Conical Metal Prover Measures 5L & 10L (RRSL/FL/2026/012)",
                    ObservedMeasurement = "Delivery of 5.004 L on 5.000 L preset (+0.08%)",
                    PermissibleError = "+/- 0.3% (+/- 15 mL on 5 Litres)",
                    Result = "PASS",
                    Remarks = "Totalizer reading 1,421,908 Litres. Security seal wire intact. Delivery error +0.08% well within permissible limits.",
                    LeadSealTagNumber = "DL-LM-SEAL-88402",
                    Status = "Completed"
                };

                await context.Inspections.AddRangeAsync(insp1, insp2);
                await context.SaveChangesAsync();

                // Seed Certificate 1 (Valid)
                var cert1 = new Certificate
                {
                    Id = "CERT-2026-001",
                    CertificateNumber = "CERT-2026-000001",
                    ApplicationId = app1.Id,
                    InstrumentId = inst2.Id,
                    OwnerId = applicant.Id,
                    OfficerId = officer.Id,
                    VerificationDate = app1.ApprovalDate ?? DateTime.UtcNow.AddMonths(-3),
                    ExpiryDate = DateTime.UtcNow.AddMonths(9),
                    Status = "VALID",
                    QrVerificationToken = "https://metroverify360.gov.in/verify/CERT-2026-000001",
                    ReportPath = $"/reports/NAWI_Report_{app1.Id}.pdf",
                    DigitalSignatureHash = "SHA256:8f4c2e1b99a67d021c3b5f90a982ee3310f882ad34bb1c828941bc0091ef3e12",
                    SealTagNumber = "DL-LM-SEAL-77914",
                    IssuingAuthority = "Department of Legal Metrology, Government of India",
                    CreatedAt = DateTime.UtcNow.AddMonths(-3)
                };

                // Seed Certificate 2 (Expired)
                var cert2 = new Certificate
                {
                    Id = "CERT-2024-001",
                    CertificateNumber = "CERT-2024-109001",
                    ApplicationId = appLegacy1.Id,
                    InstrumentId = inst1.Id,
                    OwnerId = applicant.Id,
                    OfficerId = officer.Id,
                    VerificationDate = DateTime.UtcNow.AddYears(-2),
                    ExpiryDate = DateTime.UtcNow.AddYears(-1),
                    Status = "EXPIRED",
                    QrVerificationToken = "https://metroverify360.gov.in/verify/CERT-2024-109001",
                    DigitalSignatureHash = "SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
                    SealTagNumber = "DL-LM-SEAL-33109",
                    IssuingAuthority = "Department of Legal Metrology, Government of India",
                    CreatedAt = DateTime.UtcNow.AddYears(-2)
                };

                // Seed Certificate 3 (Revoked)
                var cert3 = new Certificate
                {
                    Id = "CERT-2024-002",
                    CertificateNumber = "CERT-2024-008101",
                    ApplicationId = appLegacy2.Id,
                    InstrumentId = inst3.Id,
                    OwnerId = applicant.Id,
                    OfficerId = officer.Id,
                    VerificationDate = DateTime.UtcNow.AddYears(-2),
                    ExpiryDate = DateTime.UtcNow.AddYears(-1),
                    Status = "REVOKED",
                    QrVerificationToken = "https://metroverify360.gov.in/verify/CERT-2024-008101",
                    DigitalSignatureHash = "SHA256:ffff1111222233334444555566667777888899990000aaaabbbbccccddddeeee",
                    SealTagNumber = "DL-LM-SEAL-00129",
                    IssuingAuthority = "Department of Legal Metrology, Government of India",
                    RevocationReason = "Lead seal reported cut and replaced without authorization. Show-cause notice served under Section 24 of Legal Metrology Act 2009.",
                    RevocationDate = DateTime.UtcNow.AddMonths(-18),
                    CreatedAt = DateTime.UtcNow.AddYears(-2)
                };

                await context.Certificates.AddRangeAsync(cert1, cert2, cert3);
                await context.SaveChangesAsync();

                // Seed Audit Logs
                var logs = new[]
                {
                    new AuditLog { Id = Guid.NewGuid().ToString(), UserId = admin.Id, UserName = admin.Name, UserRole = "Admin", Action = "SYSTEM_INITIALIZED", EntityName = "System", EntityId = "ROOT", Description = "METROVERIFY 360 statutory engine initialized.", Timestamp = DateTime.UtcNow.AddMonths(-6) },
                    new AuditLog { Id = Guid.NewGuid().ToString(), UserId = applicant.Id, UserName = applicant.Name, UserRole = "Applicant", Action = "INSTRUMENT_REGISTERED", EntityName = "Instrument", EntityId = inst1.Id, Description = $"Registered {inst1.InstrumentName}", Timestamp = DateTime.UtcNow.AddMonths(-5) },
                    new AuditLog { Id = Guid.NewGuid().ToString(), UserId = applicant.Id, UserName = applicant.Name, UserRole = "Applicant", Action = "APPLICATION_SUBMITTED", EntityName = "Application", EntityId = app1.Id, Description = $"Submitted application {app1.ApplicationNumber}", Timestamp = DateTime.UtcNow.AddMonths(-3) },
                    new AuditLog { Id = Guid.NewGuid().ToString(), UserId = officer.Id, UserName = officer.Name, UserRole = "Officer", Action = "INSPECTION_COMPLETED", EntityName = "Inspection", EntityId = insp1.Id, Description = "NAWI Class I verification test passed. Seal DL-LM-SEAL-77914 stamped.", Timestamp = DateTime.UtcNow.AddMonths(-3).AddDays(4) },
                    new AuditLog { Id = Guid.NewGuid().ToString(), UserId = admin.Id, UserName = admin.Name, UserRole = "Admin", Action = "APPLICATION_APPROVED_CERTIFICATE_ISSUED", EntityName = "Certificate", EntityId = cert1.CertificateNumber, Description = $"Approved application {app1.ApplicationNumber}. Issued Certificate {cert1.CertificateNumber}.", Timestamp = DateTime.UtcNow.AddMonths(-3).AddDays(5) }
                };

                await context.AuditLogs.AddRangeAsync(logs);
                await context.SaveChangesAsync();

                // Seed Notifications
                var notif1 = new Notification
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = applicant.Id,
                    CertificateId = cert1.Id,
                    Title = "Verification Certificate Issued",
                    Message = $"Certificate {cert1.CertificateNumber} for {inst2.InstrumentName} has been digitally approved and stamped.",
                    NotificationType = "success",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3).AddDays(5)
                };

                var notif2 = new Notification
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = applicant.Id,
                    CertificateId = cert1.Id,
                    Title = "Statutory Reverification Due in 18 Days",
                    Message = $"Weighbridge 60T (Certificate {inst1.PreviousCertificateNumber}) expires soon. Submit renewal application.",
                    NotificationType = "warning",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                };

                await context.Notifications.AddRangeAsync(notif1, notif2);
                await context.SaveChangesAsync();
            }
        }
    }
}
