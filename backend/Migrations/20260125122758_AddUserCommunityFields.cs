using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserCommunityFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FavoriteBookId",
                table: "aspnetusers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGenerated",
                table: "aspnetusers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_aspnetusers_FavoriteBookId",
                table: "aspnetusers",
                column: "FavoriteBookId");

            migrationBuilder.AddForeignKey(
                name: "FK_aspnetusers_books_FavoriteBookId",
                table: "aspnetusers",
                column: "FavoriteBookId",
                principalTable: "books",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_aspnetusers_books_FavoriteBookId",
                table: "aspnetusers");

            migrationBuilder.DropIndex(
                name: "IX_aspnetusers_FavoriteBookId",
                table: "aspnetusers");

            migrationBuilder.DropColumn(
                name: "FavoriteBookId",
                table: "aspnetusers");

            migrationBuilder.DropColumn(
                name: "IsGenerated",
                table: "aspnetusers");
        }
    }
}
