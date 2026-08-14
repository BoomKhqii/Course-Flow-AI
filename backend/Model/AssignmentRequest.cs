using System.ComponentModel.DataAnnotations;

namespace backend.Model
{
    public class AssignmentRequest
    {
        [Required]
        [MinLength(20)]
        [MaxLength(20000)]
        public string Instructions { get; set; } = string.Empty;

        public DateOnly? CurrentDate { get; set; }

        [MaxLength(100)]
        public string? TimeZone { get; set; }

        [MaxLength(35)]
        public string? Locale { get; set; }
    }
}
