namespace backend.Model
{
    public class AssignmentAnalysis
    {
        public string Subject { get; set; } = string.Empty;

        public string AssessmentTitle { get; set; } = string.Empty;

        public DateOnly? Deadline { get; set; }

        public List<string> Requirements { get; set; } = new();

        public List<AssignmentTask> Tasks { get; set; } = new();

        public string? Warning { get; set; }
    }
}
