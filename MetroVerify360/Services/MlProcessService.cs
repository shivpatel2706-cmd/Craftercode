using System.Diagnostics;

namespace MetroVerify360.Services;

/// <summary>
/// Background hosted service that automatically launches and manages the
/// Python FastAPI ML Verification Engine process alongside the ASP.NET server.
/// The ML service runs on http://127.0.0.1:8000 (internal only).
/// </summary>
public class MlProcessService : IHostedService, IDisposable
{
    private readonly ILogger<MlProcessService> _logger;
    private readonly IConfiguration _configuration;
    private Process? _mlProcess;

    // Path to the ML model project root (where src/api/main.py lives)
    private static readonly string DefaultMlDirectory =
        Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            "ml model", "legal_metrology_ml"
        );

    public MlProcessService(ILogger<MlProcessService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var mlDir = _configuration["MlEngine:WorkingDirectory"] ?? DefaultMlDirectory;
        var mlPort = _configuration["MlEngine:Port"] ?? "8000";

        if (!Directory.Exists(mlDir))
        {
            _logger.LogWarning(
                "ML engine directory not found at '{Dir}'. ML analysis will be unavailable.",
                mlDir);
            return;
        }

        // Kill any stale process already using port 8000
        await KillProcessOnPort(mlPort, cancellationToken);

        _logger.LogInformation(
            "Starting ML Verification Engine from '{Dir}' on port {Port}...",
            mlDir, mlPort);

        var psi = new ProcessStartInfo
        {
            FileName = "python",
            Arguments = $"-m uvicorn src.api.main:app --host 127.0.0.1 --port {mlPort}",
            WorkingDirectory = mlDir,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
        };

        try
        {
            _mlProcess = new Process { StartInfo = psi, EnableRaisingEvents = true };

            _mlProcess.OutputDataReceived += (_, e) =>
            {
                if (!string.IsNullOrWhiteSpace(e.Data))
                    _logger.LogDebug("[ML] {Line}", e.Data);
            };
            _mlProcess.ErrorDataReceived += (_, e) =>
            {
                if (!string.IsNullOrWhiteSpace(e.Data))
                    _logger.LogDebug("[ML] {Line}", e.Data);
            };
            _mlProcess.Exited += (_, _) =>
                _logger.LogWarning("ML engine process exited unexpectedly.");

            _mlProcess.Start();
            _mlProcess.BeginOutputReadLine();
            _mlProcess.BeginErrorReadLine();

            // Give it a moment to boot
            await Task.Delay(3000, cancellationToken);

            _logger.LogInformation(
                "ML Verification Engine started (PID {Pid}) on http://127.0.0.1:{Port}",
                _mlProcess.Id, mlPort);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to start ML engine. Ensure Python and uvicorn are installed. " +
                "ML analysis endpoints will return 503.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        if (_mlProcess is { HasExited: false })
        {
            _logger.LogInformation("Stopping ML Verification Engine (PID {Pid})...", _mlProcess.Id);
            try
            {
                _mlProcess.Kill(entireProcessTree: true);
                _mlProcess.WaitForExit(3000);
                _logger.LogInformation("ML engine stopped.");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error while stopping ML engine.");
            }
        }
        return Task.CompletedTask;
    }

    private static async Task KillProcessOnPort(string port, CancellationToken ct)
    {
        try
        {
            // Windows: find PID using port, then kill it
            var findPsi = new ProcessStartInfo
            {
                FileName = "cmd",
                Arguments = $"/c netstat -ano | findstr :{port}",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true,
            };
            using var findProc = Process.Start(findPsi);
            if (findProc is null) return;
            var output = await findProc.StandardOutput.ReadToEndAsync(ct);
            await findProc.WaitForExitAsync(ct);

            foreach (var line in output.Split('\n'))
            {
                var parts = line.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length >= 5 && parts[1].Contains($":{port}") &&
                    int.TryParse(parts[^1], out var pid) && pid > 0)
                {
                    try { Process.GetProcessById(pid).Kill(); } catch { }
                    break;
                }
            }
        }
        catch { /* Non-critical */ }
    }

    public void Dispose()
    {
        _mlProcess?.Dispose();
        GC.SuppressFinalize(this);
    }
}
