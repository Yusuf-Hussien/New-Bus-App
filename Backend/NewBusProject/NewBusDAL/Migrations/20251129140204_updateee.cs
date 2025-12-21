using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NewBusDAL.Migrations
{
    /// <inheritdoc />
    public partial class updateee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatedByAdminID",
                table: "Drivers",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_CreatedByAdminID",
                table: "Drivers",
                column: "CreatedByAdminID");

            migrationBuilder.AddForeignKey(
                name: "FK_Drivers_Admins_CreatedByAdminID",
                table: "Drivers",
                column: "CreatedByAdminID",
                principalTable: "Admins",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drivers_Admins_CreatedByAdminID",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_CreatedByAdminID",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "CreatedByAdminID",
                table: "Drivers");
        }
    }
}
