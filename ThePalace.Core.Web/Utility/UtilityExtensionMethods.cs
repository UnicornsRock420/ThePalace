using Microsoft.AspNetCore.Http;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using ThePalace.Core.Constants;

namespace ThePalace.Server.Web.Utility
{
    public static class UtilityExtensionMethods
    {
        public static async Task<string> getRawPostData(this HttpRequest Request)
        {
            var result = (string)null;

            Request.Body.Seek(0, SeekOrigin.Begin);

            using (var sr = new StreamReader(Request.Body, Encoding.ASCII, true, NetworkConstants.FILE_STREAM_BUFFER_SIZE, true))
            {
                result = await sr.ReadToEndAsync();
            }

            Request.Body.Seek(0, SeekOrigin.Begin);

            return result;
        }

        public static async Task<byte[]> getRawPostData(this HttpRequest Request, int limit, int offset = 0)
        {
            using (var mem = new MemoryStream())
            {
                Request.Body.Seek(offset, SeekOrigin.Begin);

                await Request.Body.CopyToAsync(mem, limit);

                Request.Body.Seek(0, SeekOrigin.Begin);

                return mem.ToArray();
            }
        }
    }
}
