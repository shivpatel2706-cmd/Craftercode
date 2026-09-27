using Microsoft.AspNetCore.Mvc;

namespace MetroVerify360.Controllers;

/// <summary>
/// Proxies all AI/ML verification requests to the Python FastAPI
/// ML engine.
///
/// Frontend calls:
///     /api/ml/*
///
/// ASP.NET proxies to:
///     MlEngine:BaseUrl
///
/// Local development:
///     http://127.0.0.1:8000
///
/// Production / Render:
///     https://ml-engine-hw7a.onrender.com
/// </summary>
[ApiController]
[Route("api/ml")]
public class MLController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<MLController> _logger;
    private readonly string _mlBaseUrl;

    public MLController(
        IHttpClientFactory httpClientFactory,
        ILogger<MLController> logger,
        IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;

        // Render can override this using:
        // MlEngine__BaseUrl=https://ml-engine-hw7a.onrender.com
        //
        // Local development falls back to the local Python ML engine.
        _mlBaseUrl = configuration["MlEngine:BaseUrl"]
            ?? "http://127.0.0.1:8000";
    }

    private HttpClient CreateClient()
    {
        return _httpClientFactory.CreateClient("MlEngine");
    }

    // ── Health ──────────────────────────────────────────────────────────────

    /// <summary>
    /// GET /api/ml/health
    /// Checks whether the ML engine is healthy and models are loaded.
    /// </summary>
    [HttpGet("health")]
    public async Task<IActionResult> Health()
    {
        try
        {
            var client = CreateClient();

            var response = await client.GetAsync(
                $"{_mlBaseUrl}/health"
            );

            var content = await response.Content.ReadAsStringAsync();

            return Content(
                content,
                "application/json"
            );
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                "ML engine health check failed: {Msg}",
                ex.Message
            );

            return StatusCode(503, new
            {
                status = "unavailable",
                message =
                    "ML engine is starting up or unreachable. Retry in a few seconds.",
                detail = ex.Message
            });
        }
    }

    // ── Model Info ──────────────────────────────────────────────────────────

    /// <summary>
    /// GET /api/ml/model/info
    /// Returns ML model version and benchmark information.
    /// </summary>
    [HttpGet("model/info")]
    public async Task<IActionResult> ModelInfo()
    {
        try
        {
            var client = CreateClient();

            var response = await client.GetAsync(
                $"{_mlBaseUrl}/model/info"
            );

            var content = await response.Content.ReadAsStringAsync();

            return Content(
                content,
                "application/json"
            );
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                "ML model info failed: {Msg}",
                ex.Message
            );

            return StatusCode(503, new
            {
                message = "ML engine unavailable.",
                detail = ex.Message
            });
        }
    }

    // ── Predict ─────────────────────────────────────────────────────────────

    /// <summary>
    /// POST /api/ml/predict
    ///
    /// Proxies the verification request directly to the Python ML engine.
    /// </summary>
    [HttpPost("predict")]
    public async Task<IActionResult> Predict()
    {
        try
        {
            var client = CreateClient();

            // Forward the raw JSON request body directly to Python.
            using var requestBody = new StreamContent(Request.Body);

            requestBody.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(
                    "application/json"
                );

            var response = await client.PostAsync(
                $"{_mlBaseUrl}/predict",
                requestBody
            );

            var content = await response.Content.ReadAsStringAsync();

            _logger.LogInformation(
                "ML /predict → HTTP {Status}",
                (int)response.StatusCode
            );

            return Content(
                content,
                "application/json",
                System.Text.Encoding.UTF8
            );
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(
                "ML engine unreachable: {Msg}",
                ex.Message
            );

            return StatusCode(503, new
            {
                message =
                    "ML Verification Engine is not yet ready. Please wait a few seconds and retry.",
                detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error proxying ML predict request."
            );

            return StatusCode(500, new
            {
                message =
                    "Internal server error during ML inference.",
                detail = ex.Message
            });
        }
    }

    // ── Validate ────────────────────────────────────────────────────────────

    /// <summary>
    /// POST /api/ml/validate
    /// Performs physical sanity and regulatory validation.
    /// </summary>
    [HttpPost("validate")]
    public async Task<IActionResult> Validate()
    {
        try
        {
            var client = CreateClient();

            using var requestBody = new StreamContent(Request.Body);

            requestBody.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(
                    "application/json"
                );

            var response = await client.PostAsync(
                $"{_mlBaseUrl}/validate",
                requestBody
            );

            var content = await response.Content.ReadAsStringAsync();

            return Content(
                content,
                "application/json"
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                "ML validation request failed: {Msg}",
                ex.Message
            );

            return StatusCode(503, new
            {
                message = "ML engine unavailable.",
                detail = ex.Message
            });
        }
    }

    // ── Explain ─────────────────────────────────────────────────────────────

    /// <summary>
    /// POST /api/ml/explain
    /// Returns detailed SHAP feature attributions.
    /// </summary>
    [HttpPost("explain")]
    public async Task<IActionResult> Explain()
    {
        try
        {
            var client = CreateClient();

            using var requestBody = new StreamContent(Request.Body);

            requestBody.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(
                    "application/json"
                );

            var response = await client.PostAsync(
                $"{_mlBaseUrl}/explain",
                requestBody
            );

            var content = await response.Content.ReadAsStringAsync();

            return Content(
                content,
                "application/json"
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                "ML explanation request failed: {Msg}",
                ex.Message
            );

            return StatusCode(503, new
            {
                message = "ML engine unavailable.",
                detail = ex.Message
            });
        }
    }
}