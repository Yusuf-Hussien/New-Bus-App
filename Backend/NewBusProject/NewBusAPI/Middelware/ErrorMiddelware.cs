namespace NewBusAPI.Middelware
{
    using NewBusAPI.Repsone;
    using NewBusBLL.Exceptions;
    using System.ComponentModel.DataAnnotations;
    using System.Net;
    using System.Text.Json;

    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context); // Run the next middleware
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ERROR OCCURRED");

                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            HttpStatusCode status;

            switch (ex)
            {
                case ValidationException :
                    status = HttpStatusCode.BadRequest;
                    break;

                case NotFoundException:
                    status = HttpStatusCode.NotFound;
                    break;
                case ForBiddenException:
                       status = HttpStatusCode.Forbidden;
                    break;

                default:
                    status = HttpStatusCode.InternalServerError;
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)status;


            var result = JsonSerializer.Serialize(new ApiResponse<string>(ex.Message));

            return context.Response.WriteAsync(result);
        }
    }

}
