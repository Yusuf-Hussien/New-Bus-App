namespace NewBusAPI.Repsone
{
    public class ApiResponseSucess<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }

        public ApiResponseSucess(T data, string message)
        {
            Success = true;
            Data = data;
            Message = message;
        }

       
    }
}
