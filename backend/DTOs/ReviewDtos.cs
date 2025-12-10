using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ReviewDto
    {
        public Guid Id { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public Guid BookId { get; set; }
    }

    public class CreateReviewDto
    {
        [Required]
        public Guid BookId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }
    }
}
