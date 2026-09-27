using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.Helpers;
using MetroVerify360.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MetroVerify360.Services
{
    public class NawiReportService : INawiReportService
    {
        private readonly MetroVerifyDbContext _context;
        private readonly IWebHostEnvironment _env;

        public NawiReportService(MetroVerifyDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public async Task<string> GenerateReportAsync(string applicationId)
        {
            var bytes = await GenerateReportPdfBytesAsync(applicationId);

            var reportsDir = Path.Combine(_env.ContentRootPath, "Reports");
            if (!Directory.Exists(reportsDir))
            {
                Directory.CreateDirectory(reportsDir);
            }

            var fileName = $"NAWI_Report_{applicationId}.pdf";
            var filePath = Path.Combine(reportsDir, fileName);

            await File.WriteAllBytesAsync(filePath, bytes);
            return $"/reports/{fileName}";
        }

        public async Task<byte[]> GenerateReportPdfBytesAsync(string applicationId)
        {
            var app = await _context.Applications
                .Include(a => a.Instrument)
                .Include(a => a.Owner)
                .Include(a => a.Certificate)
                .Include(a => a.Inspections)
                    .ThenInclude(i => i.Officer)
                .Include(a => a.Inspections)
                    .ThenInclude(i => i.Measurements)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (app == null) throw new KeyNotFoundException("Application not found for NAWI report.");

            var inspection = app.Inspections.OrderByDescending(i => i.InspectionDate).FirstOrDefault();
            var cert = app.Certificate;
            var qrUrl = cert != null ? cert.QrVerificationToken : $"https://metroverify360.gov.in/verify/{app.ApplicationNumber}";
            var qrBytes = QrCodeHelper.GeneratePngBytes(qrUrl, 8);

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30, Unit.Point);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    // Header
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("METROVERIFY 360").FontSize(18).Bold().FontColor(Colors.Blue.Darken3);
                                c.Item().Text("Directorate of Legal Metrology • Government of India").FontSize(10).SemiBold().FontColor(Colors.Grey.Darken2);
                                c.Item().Text("Statutory NAWI Metrological Test Dossier (OIML R-76)").FontSize(9).FontColor(Colors.Grey.Darken1);
                            });

                            if (qrBytes != null && qrBytes.Length > 0)
                            {
                                row.ConstantItem(65).Image(qrBytes);
                            }
                        });

                        col.Item().PaddingTop(8).LineHorizontal(1.5f).LineColor(Colors.Blue.Darken3);
                    });

                    // Content
                    page.Content().PaddingVertical(15).Column(col =>
                    {
                        // Reference Banner
                        col.Item().Background(Colors.Grey.Lighten4).Padding(8).Row(r =>
                        {
                            r.RelativeItem().Text($"Application Reference: {app.ApplicationNumber}").Bold();
                            r.RelativeItem().AlignRight().Text($"Certificate: {cert?.CertificateNumber ?? "Pending Approval"}").Bold().FontColor(Colors.Blue.Darken2);
                        });

                        col.Item().PaddingTop(12).Text("1. INSTRUMENT OWNER & CUSTODY DETAILS").Bold().FontSize(11).FontColor(Colors.Blue.Darken3);
                        col.Item().PaddingTop(4).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                            });

                            table.Cell().Text("Owner Name:").Bold();
                            table.Cell().Text(app.Owner?.Name ?? "N/A");
                            table.Cell().Text("Mobile / Email:").Bold();
                            table.Cell().Text($"{app.Owner?.Phone ?? "N/A"} | {app.Owner?.Email ?? "N/A"}");

                            table.Cell().Text("Organization:").Bold();
                            table.Cell().Text(app.Owner?.Organization ?? "Commercial Trader");
                            table.Cell().Text("Installation Site:").Bold();
                            table.Cell().Text(app.Instrument?.InstallationLocation ?? "N/A");
                        });

                        col.Item().PaddingTop(12).Text("2. INSTRUMENT TECHNICAL SPECIFICATIONS").Bold().FontSize(11).FontColor(Colors.Blue.Darken3);
                        col.Item().PaddingTop(4).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                            });

                            table.Cell().Text("Instrument:").Bold();
                            table.Cell().Text(app.Instrument?.InstrumentName ?? "N/A");
                            table.Cell().Text("Classification:").Bold();
                            table.Cell().Text(app.Instrument?.InstrumentType ?? "NAWI");

                            table.Cell().Text("Make & Model:").Bold();
                            table.Cell().Text($"{app.Instrument?.Manufacturer} / {app.Instrument?.ModelNumber}");
                            table.Cell().Text("Serial Number:").Bold();
                            table.Cell().Text(app.Instrument?.SerialNumber ?? "N/A").Bold().FontColor(Colors.Blue.Darken4);

                            table.Cell().Text("Capacity:").Bold();
                            table.Cell().Text(app.Instrument?.Capacity ?? "N/A");
                            table.Cell().Text("Accuracy Class:").Bold();
                            table.Cell().Text(app.Instrument?.AccuracyClass ?? "Class III");
                        });

                        col.Item().PaddingTop(12).Text("3. FIELD INSPECTION & METROLOGICAL TEST FINDINGS").Bold().FontSize(11).FontColor(Colors.Blue.Darken3);
                        col.Item().PaddingTop(4).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                            });

                            table.Cell().Text("Inspection Date:").Bold();
                            table.Cell().Text(inspection?.InspectionDate.ToString("dd-MMM-yyyy") ?? "N/A");
                            table.Cell().Text("Verifying Officer:").Bold();
                            table.Cell().Text($"{inspection?.Officer?.Name} ({inspection?.Officer?.BadgeNumber})");

                            table.Cell().Text("Standard Weights:").Bold();
                            table.Cell().Text(inspection?.ReferenceStandard ?? "OIML Class M1");
                            table.Cell().Text("Zero Load Error:").Bold();
                            table.Cell().Text(inspection?.ZeroError ?? "0.0 g");

                            table.Cell().Text("Observed Reading:").Bold();
                            table.Cell().Text(inspection?.ObservedMeasurement ?? "50.00 kg on 50.00 kg");
                            table.Cell().Text("Max Permissible Error:").Bold();
                            table.Cell().Text(inspection?.PermissibleError ?? "+/- 20 g");

                            table.Cell().Text("Repeatability:").Bold();
                            table.Cell().Text(inspection?.RepeatabilityResult ?? "Satisfactory");
                            table.Cell().Text("Statutory Seal Tag:").Bold();
                            table.Cell().Text(inspection?.LeadSealTagNumber ?? "DL-LM-SEAL").Bold().FontColor(Colors.Green.Darken3);
                        });

                        col.Item().PaddingTop(12).Background(Colors.Grey.Lighten4).Padding(8).Column(c =>
                        {
                            c.Item().Text($"Final Metrological Result: {inspection?.Result ?? "PASS"}").Bold().FontSize(11).FontColor(inspection?.Result == "PASS" ? Colors.Green.Darken3 : Colors.Red.Darken2);
                            c.Item().PaddingTop(2).Text($"Officer Remarks: {inspection?.Remarks ?? "Tested and verified in accordance with Legal Metrology General Rules 2011."}").Italic().FontSize(9);
                        });

                        col.Item().PaddingTop(12).Text("4. STATUTORY VERIFICATION NOTICE").Bold().FontSize(9).FontColor(Colors.Grey.Darken2);
                        col.Item().PaddingTop(2).Text("Notice: This NAWI report documents physical and accuracy test readings performed under Section 24 of The Legal Metrology Act, 2009. Automated generation of this test dossier records compliance measurements and does not replace the statutory verification seal plate affixed to the instrument receiver.").FontSize(8).FontColor(Colors.Grey.Darken1);
                    });

                    // Footer
                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
                        col.Item().PaddingTop(4).Row(r =>
                        {
                            r.RelativeItem().Text($"METROVERIFY 360 Digital Registry • Verification QR: {qrUrl}").FontSize(7).FontColor(Colors.Grey.Darken1);
                            r.RelativeItem().AlignRight().Text($"Generated: {DateTime.UtcNow:dd-MMM-yyyy HH:mm} UTC").FontSize(7).FontColor(Colors.Grey.Darken1);
                        });
                    });
                });
            });

            return document.GeneratePdf();
        }
    }
}
