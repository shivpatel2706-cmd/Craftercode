namespace MetroVerify360.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        public static ApiResponse<T> Ok(T data, string message = "Success")
        {
            return new ApiResponse<T> { Success = true, Message = message, Data = data };
        }

        public static ApiResponse<T> Fail(string message, List<string>? errors = null)
        {
            return new ApiResponse<T> { Success = false, Message = message, Errors = errors };
        }

        public static ApiResponse<T> SuccessResult(T data, string message = "Success")
        {
            return Ok(data, message);
        }

        public static ApiResponse<T> FailureResult(string message, List<string>? errors = null)
        {
            return Fail(message, errors);
        }
    }

    public class ApiResponse : ApiResponse<object>
    {
        public static ApiResponse SuccessResult(string message = "Success")
        {
            return new ApiResponse { Success = true, Message = message };
        }

        public static ApiResponse ErrorResult(string message, List<string>? errors = null)
        {
            return new ApiResponse { Success = false, Message = message, Errors = errors };
        }

        public static new ApiResponse FailureResult(string message, List<string>? errors = null)
        {
            return ErrorResult(message, errors);
        }
    }
}
