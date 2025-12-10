using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NewBusDAL.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMTripTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CancelAt",
                table: "Trips",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompleteAt",
                table: "Trips",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmptyAt",
                table: "Trips",
                type: "datetime2",
                nullable: true);
        }
       
        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancelAt",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "CompleteAt",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "EmptyAt",
                table: "Trips");
        }
    }
}
