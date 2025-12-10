using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NewBusDAL.Migrations
{
    /// <inheritdoc />
    public partial class Updateeeeee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "StartAt",
                table: "Trips",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndAt",
                table: "Trips",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "CreatedByDriverId",
                table: "Trips",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Trips_CreatedByDriverId",
                table: "Trips",
                column: "CreatedByDriverId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Drivers_CreatedByDriverId",
                table: "Trips",
                column: "CreatedByDriverId",
                principalTable: "Drivers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Drivers_CreatedByDriverId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_CreatedByDriverId",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "CreatedByDriverId",
                table: "Trips");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartAt",
                table: "Trips",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndAt",
                table: "Trips",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }
    }
}
