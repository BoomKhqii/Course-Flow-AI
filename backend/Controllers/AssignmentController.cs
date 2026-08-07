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
    public async Task<ActionResult<AssignmentAnalysis>> Analyze(
        [FromBody] AssignmentRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var analysis = await _geminiService.AnalyzeAsync(
                request.Instructions,
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
