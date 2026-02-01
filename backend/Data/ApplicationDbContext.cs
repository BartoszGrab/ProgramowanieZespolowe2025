using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    /// <summary>
    /// Entity Framework Core database context for the application.
    /// Extends <see cref="IdentityDbContext{ApplicationUser}"/> with application-specific DbSets.
    /// </summary>
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        /// <summary>
        /// Initializes a new instance of <see cref="ApplicationDbContext"/> using the specified options.
        /// </summary>
        /// <param name="options">The options used to configure the database context.</param>
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        /// <summary>
        /// Refresh tokens for JWT refresh flows.
        /// </summary>
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        /// <summary>
        /// Books stored in the local catalog.
        /// </summary>
        public DbSet<Book> Books { get; set; }

        /// <summary>
        /// Authors of books.
        /// </summary>
        public DbSet<Author> Authors { get; set; }

        /// <summary>
        /// Genres or categories associated with books.
        /// </summary>
        public DbSet<Genre> Genres { get; set; }

        /// <summary>
        /// Join table between books and authors.
        /// </summary>
        public DbSet<BookAuthor> BookAuthors { get; set; }

        /// <summary>
        /// Join table between books and genres.
        /// </summary>
        public DbSet<BookGenre> BookGenres { get; set; }

        /// <summary>
        /// User-written reviews for books.
        /// </summary>
        public DbSet<Review> Reviews { get; set; }

        /// <summary>
        /// User-created shelves.
        /// </summary>
        public DbSet<Shelf> Shelves { get; set; }

        /// <summary>
        /// Books on user shelves (join table with additional metadata).
        /// </summary>
        public DbSet<ShelfBook> ShelfBooks { get; set; }

        /// <summary>
        /// Social posts created by users.
        /// </summary>
        public DbSet<Post> Posts { get; set; }

        /// <summary>
        /// Comments attached to posts.
        /// </summary>
        public DbSet<Comment> Comments { get; set; }

        /// <summary>
        /// Likes on posts (user-post relationship).
        /// </summary>
        public DbSet<Like> Likes { get; set; }

        /// <summary>
        /// User follow relationships (self-referencing).
        /// </summary>
        public DbSet<UserFollow> UserFollows { get; set; }

        /// <summary>
        /// Notifications for user activity.
        /// </summary>
        public DbSet<Notification> Notifications { get; set; }

        /// <summary>
        /// Recommendations generated for users by the recommendations service.
        /// </summary>
        public DbSet<UserRecommendation> UserRecommendations { get; set; }


        /// <summary>
        /// Performs EF Core model configuration: sets table naming conventions and configures relationship mappings.
        /// </summary>
        /// <remarks>
        /// Table names are normalized to lowercase to fit PostgreSQL conventions. Composite keys and relationships
        /// for join tables (BookAuthor, BookGenre, ShelfBook) and other relations are configured here.
        /// </remarks>
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure table names for PostgreSQL (lowercase)
            foreach (var entity in builder.Model.GetEntityTypes())
            {
                entity.SetTableName(entity.GetTableName()?.ToLower());
            }
            // --- Configure relations ---

            // 1. BookAuthor (Book - Author)
            builder.Entity<BookAuthor>()
                .HasKey(ba => new { ba.BookId, ba.AuthorId });

            builder.Entity<BookAuthor>()
                .HasOne(ba => ba.Book)
                .WithMany(b => b.BookAuthors)
                .HasForeignKey(ba => ba.BookId);

            builder.Entity<BookAuthor>()
                .HasOne(ba => ba.Author)
                .WithMany(a => a.BookAuthors)
                .HasForeignKey(ba => ba.AuthorId);

            // 2. BookGenre (Book - Genre)
            builder.Entity<BookGenre>()
                .HasKey(bg => new { bg.BookId, bg.GenreId });

            builder.Entity<BookGenre>()
                .HasOne(bg => bg.Book)
                .WithMany(b => b.BookGenres)
                .HasForeignKey(bg => bg.BookId);

            builder.Entity<BookGenre>()
                .HasOne(bg => bg.Genre)
                .WithMany(g => g.BookGenres)
                .HasForeignKey(bg => bg.GenreId);

            // 3. ShelfBook (Shelf - Book)
            builder.Entity<ShelfBook>()
                .HasKey(sb => new { sb.ShelfId, sb.BookId });

            builder.Entity<ShelfBook>()
                .HasOne(sb => sb.Shelf)
                .WithMany(s => s.ShelfBooks)
                .HasForeignKey(sb => sb.ShelfId);

            builder.Entity<ShelfBook>()
                .HasOne(sb => sb.Book)
                .WithMany(b => b.ShelfBooks)
                .HasForeignKey(sb => sb.BookId);

            // 4. Like (User - Post)
            builder.Entity<Like>()
                .HasKey(l => new { l.UserId, l.PostId });

            builder.Entity<Like>()
                .HasOne(l => l.User)
                .WithMany(u => u.Likes)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // 5. UserFollow (Self-Referencing)
            builder.Entity<UserFollow>()
                .HasKey(uf => new { uf.ObserverId, uf.TargetId });

            builder.Entity<UserFollow>()
                .HasOne(uf => uf.Observer)
                .WithMany(u => u.Following)
                .HasForeignKey(uf => uf.ObserverId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<UserFollow>()
                .HasOne(uf => uf.Target)
                .WithMany(u => u.Followers)
                .HasForeignKey(uf => uf.TargetId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
