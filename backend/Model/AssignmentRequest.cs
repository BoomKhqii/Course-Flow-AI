using System.ComponentModel.DataAnnotations;

namespace backend.Model
{
    public class AssignmentRequest
    {
        [Required]
        [MinLength(20)]
        [MaxLength(20000)]
        public string Instructions { get; set; } = string.Empty;
    }
}
