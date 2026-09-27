using Microsoft.EntityFrameworkCore;
using MetroVerify360.Models;

namespace MetroVerify360.Data
{
    public class MetroVerifyDbContext : DbContext
    {
        public MetroVerifyDbContext(DbContextOptions<MetroVerifyDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Instrument> Instruments => Set<Instrument>();
        public DbSet<Application> Applications => Set<Application>();
        public DbSet<OfficerAssignment> OfficerAssignments => Set<OfficerAssignment>();
        public DbSet<Inspection> Inspections => Set<Inspection>();
        public DbSet<InspectionMeasurement> InspectionMeasurements => Set<InspectionMeasurement>();
        public DbSet<Certificate> Certificates => Set<Certificate>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // Instrument
            modelBuilder.Entity<Instrument>(entity =>
            {
                entity.HasIndex(i => i.SerialNumber).IsUnique();

                entity.HasOne(i => i.Owner)
                    .WithMany(u => u.Instruments)
                    .HasForeignKey(i => i.OwnerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Application
            modelBuilder.Entity<Application>(entity =>
            {
                entity.HasIndex(a => a.ApplicationNumber).IsUnique();

                entity.HasOne(a => a.Instrument)
                    .WithMany(i => i.Applications)
                    .HasForeignKey(a => a.InstrumentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Owner)
                    .WithMany(u => u.Applications)
                    .HasForeignKey(a => a.OwnerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(a => a.FeeAmount)
                    .HasPrecision(18, 2);
            });

            // OfficerAssignment
            modelBuilder.Entity<OfficerAssignment>(entity =>
            {
                entity.HasOne(oa => oa.Application)
                    .WithMany(a => a.Assignments)
                    .HasForeignKey(oa => oa.ApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oa => oa.Officer)
                    .WithMany(u => u.AssignedInspections)
                    .HasForeignKey(oa => oa.OfficerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Inspection
            modelBuilder.Entity<Inspection>(entity =>
            {
                entity.HasOne(i => i.Application)
                    .WithMany(a => a.Inspections)
                    .HasForeignKey(i => i.ApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(i => i.Officer)
                    .WithMany(u => u.ConductedInspections)
                    .HasForeignKey(i => i.OfficerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // InspectionMeasurement
            modelBuilder.Entity<InspectionMeasurement>(entity =>
            {
                entity.HasOne(im => im.Inspection)
                    .WithMany(i => i.Measurements)
                    .HasForeignKey(im => im.InspectionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Certificate
            modelBuilder.Entity<Certificate>(entity =>
            {
                entity.HasIndex(c => c.CertificateNumber).IsUnique();

                entity.HasOne(c => c.Application)
                    .WithOne(a => a.Certificate)
                    .HasForeignKey<Certificate>(c => c.ApplicationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Instrument)
                    .WithMany(i => i.Certificates)
                    .HasForeignKey(c => c.InstrumentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Owner)
                    .WithMany()
                    .HasForeignKey(c => c.OwnerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Officer)
                    .WithMany(u => u.IssuedCertificates)
                    .HasForeignKey(c => c.OfficerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Notification
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasOne(n => n.User)
                    .WithMany(u => u.Notifications)
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
