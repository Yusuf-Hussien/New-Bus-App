
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NewBusDAL.Migrations
{
    /// <inheritdoc />
    public partial class mamaammm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ResetPasswordAdmins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OTP = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdminId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResetPasswordAdmins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResetPasswordAdmins_Admins_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Admins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResetPasswordDrivers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OTP = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DriverId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResetPasswordDrivers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResetPasswordDrivers_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ResetPasswordAdmins_AdminId",
                table: "ResetPasswordAdmins",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_ResetPasswordDrivers_DriverId",
                table: "ResetPasswordDrivers",
                column: "DriverId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResetPasswordAdmins");

            migrationBuilder.DropTable(
                name: "ResetPasswordDrivers");
        }
    }
}
