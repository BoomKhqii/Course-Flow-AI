using backend.Model;

namespace backend.Service;

public interface IGeminiService
{
    Task<AssignmentAnalysis> AnalyzeAsync(
        string instructions,
        CancellationToken cancellationToken = default);
}