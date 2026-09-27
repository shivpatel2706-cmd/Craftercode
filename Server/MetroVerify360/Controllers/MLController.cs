using Microsoft.AspNetCore.Mvc;

namespace MetroVerify360.Controllers;

/// <summary>
/// Proxies all AI/ML verification requests to the internal Python FastAPI
/// ML engine running on http://127.0.0.1:8000.
/// 
/// Frontend calls  →  POST /api/ml/predict  (ASP.NET, port 5051)
/// ASP.NET proxies →  POST http://127.0.0.1:8000/predict  (Python, internal)
/// 
/// This means the user only needs ONE running server (dotnet run).
/// </summary>
[ApiController]
[Route("api/ml")]
public class MLController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<MLController> _logger;
    private const string MlBaseUrl = "http://127.0.0.1:8000";

    public MLController(IHttpClientFactory httpClientFactory, ILogger<MLController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    private HttpClient CreateClient() =>
        _httpClientFactory.CreateClient("MlEngine");

    // ── Health ───────────────────────────────────────────────────────────────

    /// <summary>GET /api/ml/health — Check ML engine status.</summary>
    [HttpGet("health")]
    public async Task<IActionResult> Health()
    {
        try
        {
            var client = CreateClient();
            var response = await client.GetAsync($"{MlBaseUrl}/health");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogWarning("ML engine health check failed: {Msg}", ex.Message);
            return StatusCode(503, new
            {
                status = "unavailable",
                message = "ML engine is starting up or unreachable. Retry in a few seconds.",
                detail = ex.Message
            });
        }
    }

    // ── Model Info ───────────────────────────────────────────────────────────

    /// <summary>GET /api/ml/model/info — Model version and benchmark metrics.</summary>
    [HttpGet("model/info")]
    public async Task<IActionResult> ModelInfo()
    {
        try
        {
            var client = CreateClient();
            var response = await client.GetAsync($"{MlBaseUrl}/model/info");
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogWarning("ML model info failed: {Msg}", ex.Message);
            return StatusCode(503, new { message = "ML engine unavailable.", detail = ex.Message });
        }
    }

    // ── Predict ──────────────────────────────────────────────────────────────

    /// <summary>
    /// POST /api/ml/predict — Full AI/ML verification pipeline.
    /// Proxies the raw JSON body directly to the Python engine.
    /// Returns: prediction, confidence, risk_score, rules_engine_result,
    ///          final_result, rule_violations, SHAP explanation.
    /// </summary>
    [HttpPost("predict")]
    public async Task<IActionResult> Predict()
    {
        try
        {
            var client = CreateClient();

            // Forward the raw request body directly to Python
            using var requestBody = new StreamContent(Request.Body);
            requestBody.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");

            var response = await client.PostAsync($"{MlBaseUrl}/predict", requestBody);
            var content = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("ML /predict → HTTP {Status}", (int)response.StatusCode);
            return Content(content, "application/json", System.Text.Encoding.UTF8);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError("ML engine unreachable: {Msg}", ex.Message);
            return StatusCode(503, new
            {
                message = "ML Verification Engine is not yet ready. It starts automatically with the server — please wait 5–10 seconds and retry.",
                detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error proxying ML predict request.");
            return StatusCode(500, new { message = "Internal server error during ML inference.", detail = ex.Message });
        }
    }

    // ── Validate ─────────────────────────────────────────────────────────────

    /// <summary>POST /api/ml/validate — Physical sanity and regulatory pre-check.</summary>
    [HttpPost("validate")]
    public async Task<IActionResult> Validate()
    {
        try
        {
            var client = CreateClient();
            using var requestBody = new StreamContent(Request.Body);
            requestBody.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");

            var response = await client.PostAsync($"{MlBaseUrl}/validate", requestBody);
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { message = "ML engine unavailable.", detail = ex.Message });
        }
    }

    // ── Explain ──────────────────────────────────────────────────────────────

    /// <summary>POST /api/ml/explain — Detailed SHAP local feature attributions.</summary>
    [HttpPost("explain")]
    public async Task<IActionResult> Explain()
    {
        try
        {
            var client = CreateClient();
            using var requestBody = new StreamContent(Request.Body);
            requestBody.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");

            var response = await client.PostAsync($"{MlBaseUrl}/explain", requestBody);
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { message = "ML engine unavailable.", detail = ex.Message });
        }
    }
}
