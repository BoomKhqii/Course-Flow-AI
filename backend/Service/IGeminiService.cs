using backend.Model;

namespace backend.Service;

public interface IGeminiService
{
    Task<AssignmentAnalysisBatch> AnalyzeAsync(
        string instructions,
        DateOnly currentDate,
        string timeZone,
        string locale,
        CancellationToken cancellationToken = default);
}
