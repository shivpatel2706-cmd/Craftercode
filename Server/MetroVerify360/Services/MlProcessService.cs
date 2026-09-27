using System.Diagnostics;
using System.Net.Sockets;

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

    // ML model project root (where src/api/main.py lives).
    private static readonly string DefaultMlDirectory =
        Path.GetFullPath(
            Path.Combine(
                AppContext.BaseDirectory,
                "..", "..", "..", "..", "ML"));

    public MlProcessService(
        ILogger<MlProcessService> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var configuredMlDir = _configuration["MlEngine:WorkingDirectory"];
        var mlDir = Path.GetFullPath(
            configuredMlDir ?? DefaultMlDirectory);

        var mlPort = _configuration["MlEngine:Port"] ?? "8000";

        if (!Directory.Exists(mlDir))
        {
            _logger.LogWarning(
                "ML engine directory not found at '{Dir}'. " +
                "ML analysis will be unavailable.",
                mlDir);

            return;
        }

        // Only attempt to clear the port if something is actually
        // listening on it. This avoids Windows-specific commands such
        // as cmd/netstat/findstr and works on Linux as well.
        await WaitForPortToBeFree(
            "127.0.0.1",
            int.Parse(mlPort),
            cancellationToken);

        _logger.LogInformation(
            "Starting ML Verification Engine from '{Dir}' on port {Port}...",
            mlDir,
            mlPort);

        var venvPython = OperatingSystem.IsWindows()
    ? Path.Combine(mlDir, ".venv", "Scripts", "python.exe")
    : Path.Combine(mlDir, ".venv", "bin", "python");

var pythonCommand = File.Exists(venvPython)
    ? venvPython
    : (OperatingSystem.IsWindows() ? "python" : "python3");

        var psi = new ProcessStartInfo
        {
            FileName = pythonCommand,
            Arguments =
                $"-m uvicorn src.api.main:app " +
                $"--host 127.0.0.1 --port {mlPort}",

            WorkingDirectory = mlDir,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
        };

        try
        {
            _mlProcess = new Process
            {
                StartInfo = psi,
                EnableRaisingEvents = true
            };

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
                _logger.LogWarning(
                    "ML engine process exited unexpectedly.");

            _mlProcess.Start();

            _mlProcess.BeginOutputReadLine();
            _mlProcess.BeginErrorReadLine();

            // Give the Python service time to boot.
            await Task.Delay(3000, cancellationToken);

            if (_mlProcess.HasExited)
            {
                _logger.LogError(
                    "ML engine exited during startup.");

                return;
            }

            _logger.LogInformation(
                "ML Verification Engine started (PID {Pid}) " +
                "on http://127.0.0.1:{Port}",
                _mlProcess.Id,
                mlPort);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to start ML engine. Ensure Python and " +
                "uvicorn are installed. ML analysis endpoints " +
                "will return 503.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        if (_mlProcess is { HasExited: false })
        {
            _logger.LogInformation(
                "Stopping ML Verification Engine (PID {Pid})...",
                _mlProcess.Id);

            try
            {
                _mlProcess.Kill(entireProcessTree: true);
                _mlProcess.WaitForExit(3000);

                _logger.LogInformation(
                    "ML engine stopped.");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Error while stopping ML engine.");
            }
        }

        return Task.CompletedTask;
    }

    private async Task WaitForPortToBeFree(
        string host,
        int port,
        CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < 10; attempt++)
        {
            try
            {
                using var client = new TcpClient();

                var connectTask = client.ConnectAsync(host, port);

                await Task.WhenAny(
                    connectTask,
                    Task.Delay(300, cancellationToken));

                if (!connectTask.IsCompletedSuccessfully)
                {
                    // Nothing is listening on the port.
                    return;
                }

                _logger.LogWarning(
                    "Port {Port} is currently in use. " +
                    "Waiting for it to become available...",
                    port);

                await Task.Delay(500, cancellationToken);
            }
            catch
            {
                // Connection failed = nothing is listening.
                return;
            }
        }

        _logger.LogWarning(
            "Port {Port} may still be in use. " +
            "Continuing with ML engine startup.",
            port);
    }

    public void Dispose()
    {
        _mlProcess?.Dispose();
        GC.SuppressFinalize(this);
    }
}