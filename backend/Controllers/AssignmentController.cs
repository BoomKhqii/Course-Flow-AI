using backend.Model;
using backend.Service;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public sealed class AssignmentController : ControllerBase
{
    private readonly IGeminiService _geminiService;

    public AssignmentController(IGeminiService geminiService)
    {
        _geminiService = geminiService;
    }

    [HttpPost("analyze")]
    public async Task<ActionResult<AssignmentAnalysisBatch>> Analyze(
        [FromBody] AssignmentRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var analysis = await _geminiService.AnalyzeAsync(
                request.Instructions,
                request.CurrentDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
                string.IsNullOrWhiteSpace(request.TimeZone) ? "UTC" : request.TimeZone.Trim(),
                string.IsNullOrWhiteSpace(request.Locale) ? "en" : request.Locale.Trim(),
                cancellationToken);

            return Ok(analysis);
        }
        catch (HttpRequestException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Gemini request failed",
                detail: exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Assignment analysis failed",
                detail: exception.Message);
        }
    }
}
