using QRCoder;

namespace MetroVerify360.Helpers
{
    public static class QrCodeHelper
    {
        public static byte[] GeneratePngBytes(string payload, int pixelsPerModule = 10)
        {
            using var generator = new QRCodeGenerator();
            using var data = generator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
            var qrCode = new PngByteQRCode(data);
            return qrCode.GetGraphic(pixelsPerModule);
        }

        public static string GenerateBase64(string payload, int pixelsPerModule = 10)
        {
            var bytes = GeneratePngBytes(payload, pixelsPerModule);
            return Convert.ToBase64String(bytes);
        }
    }
}
