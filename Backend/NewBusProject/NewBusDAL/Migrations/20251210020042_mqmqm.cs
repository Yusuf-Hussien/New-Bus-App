using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NewBusDAL.Migrations
{
    /// <inheritdoc />
    public partial class mqmqm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "ResetPasswordStudents",
                newName: "IsVerified");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "ResetPasswordDrivers",
                newName: "IsVerified");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "ResetPasswordAdmins",
                newName: "IsVerified");

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpireAt",
                table: "ResetPasswordStudents",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpireAt",
                table: "ResetPasswordDrivers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpireAt",
                table: "ResetPasswordAdmins",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpireAt",
                table: "ResetPasswordStudents");

            migrationBuilder.DropColumn(
                name: "ExpireAt",
                table: "ResetPasswordDrivers");

            migrationBuilder.DropColumn(
                name: "ExpireAt",
                table: "ResetPasswordAdmins");

            migrationBuilder.RenameColumn(
                name: "IsVerified",
                table: "ResetPasswordStudents",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "IsVerified",
                table: "ResetPasswordDrivers",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "IsVerified",
                table: "ResetPasswordAdmins",
                newName: "IsActive");
        }
    }
}
