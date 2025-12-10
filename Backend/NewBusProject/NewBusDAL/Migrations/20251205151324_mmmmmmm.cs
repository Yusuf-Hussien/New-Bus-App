using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NewBusDAL.Migrations
{
    /// <inheritdoc />
    public partial class mmmmmmm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routes_Routes_RouteId",
                table: "Routes");

            migrationBuilder.DropIndex(
                name: "IX_Routes_RouteId",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "RouteId",
                table: "Routes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RouteId",
                table: "Routes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Routes_RouteId",
                table: "Routes",
                column: "RouteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Routes_Routes_RouteId",
                table: "Routes",
                column: "RouteId",
                principalTable: "Routes",
                principalColumn: "Id");
        }
    }
}
