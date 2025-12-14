using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Shelf
    {
        /// <summary>
        /// Unique identifier for the shelf
        /// </summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Name of the shelf
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Foreign key for the user who owns the shelf
        /// </summary>
        [ForeignKey(nameof(ApplicationUser))]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Navigation property to the user who owns the shelf
        /// </summary>
        public ApplicationUser User { get; set; } = null!;

        /// <summary>
        /// Collection of shelf-book relationships representing books on this shelf
        /// </summary>
        public ICollection<ShelfBook> ShelfBooks { get; set; } = new List<ShelfBook>();
    }
}