using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InstrumentsController : BaseApiController
    {
        private readonly IInstrumentService _instrumentService;

        public InstrumentsController(IInstrumentService instrumentService)
        {
            _instrumentService = instrumentService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<InstrumentDto>>>> GetInstruments([FromQuery] string? ownerId = null)
        {
            // If the user is an Applicant, restrict to their own instruments
            var effectiveOwnerId = IsApplicant ? CurrentUserId : ownerId;
            var instruments = await _instrumentService.GetInstrumentsAsync(effectiveOwnerId);
            return Ok(ApiResponse<IEnumerable<InstrumentDto>>.SuccessResult(instruments));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<InstrumentDto>>> GetInstrumentById(string id)
        {
            var instrument = await _instrumentService.GetInstrumentByIdAsync(id);
            if (instrument == null)
            {
                return NotFound(ApiResponse<InstrumentDto>.FailureResult("Instrument not found."));
            }

            // Applicants cannot view instruments belonging to others
            if (IsApplicant && instrument.OwnerId != CurrentUserId)
            {
                return Forbid();
            }

            return Ok(ApiResponse<InstrumentDto>.SuccessResult(instrument));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<InstrumentDto>>> CreateInstrument([FromBody] CreateInstrumentRequest request)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized(ApiResponse<InstrumentDto>.FailureResult("User not authenticated."));
            }

            var instrument = await _instrumentService.CreateInstrumentAsync(CurrentUserId, request);
            return CreatedAtAction(nameof(GetInstrumentById), new { id = instrument.Id }, ApiResponse<InstrumentDto>.SuccessResult(instrument, "Instrument registered successfully."));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<InstrumentDto>>> UpdateInstrument(string id, [FromBody] UpdateInstrumentRequest request)
        {
            var existing = await _instrumentService.GetInstrumentByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse<InstrumentDto>.FailureResult("Instrument not found."));
            }

            if (IsApplicant && existing.OwnerId != CurrentUserId)
            {
                return Forbid();
            }

            var updated = await _instrumentService.UpdateInstrumentAsync(id, request);
            return Ok(ApiResponse<InstrumentDto>.SuccessResult(updated!, "Instrument updated successfully."));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteInstrument(string id)
        {
            var existing = await _instrumentService.GetInstrumentByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse<bool>.FailureResult("Instrument not found."));
            }

            if (IsApplicant && existing.OwnerId != CurrentUserId)
            {
                return Forbid();
            }

            var success = await _instrumentService.DeleteInstrumentAsync(id);
            return Ok(ApiResponse<bool>.SuccessResult(success, "Instrument deleted successfully."));
        }
    }
}
