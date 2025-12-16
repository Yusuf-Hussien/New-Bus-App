namespace NewBusAPI.Repsone
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
       

        public ApiResponse(T data, string message)
        {
            Success = true;
            Data = data;
            Message = message;
        }
        public ApiResponse(string message)
        {
            Success = false ;
            Message = message;
        }

    }
}
