using System.ComponentModel.DataAnnotations;

namespace backend.Model
{
    public class AssignmentTask
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Range(1, 1440)]
        public int EstimatedMinutes { get; set; }
    }
}
