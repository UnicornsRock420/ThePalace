using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using ThePalace.Core.Constants;
using ThePalace.Core.Utility;

namespace ThePalace.Server.Web.Utility
{
    public static class Multipart
    {
        public static bool GetFiles(this Stream stream, MultipartModel model)
        {
            var result = false;

            var data = ToByteArray(stream);
            var content = data.GetString();
            var delimiterEndIndex = content.IndexOf("\r\n");

            if (delimiterEndIndex > -1)
            {
                var delimiter = content.Substring(0, delimiterEndIndex);
                var delimiterBytes = ("\r\n" + delimiter).GetBytes();
                var regexFileName = new Regex(@"(?<=filename\=\"")(.*?)(?=\"")");
                var regexContentType = new Regex(@"(?<=Content\-Type:)(.*?)(?=\r\n\r\n)");

                model.files = new List<MultipartFile>();

                for (var endIndex = 0; endIndex < data.Length;)
                {
                    try
                    {
                        var filenameMatch = regexFileName.Match(content, endIndex);
                        var contentTypeMatch = regexContentType.Match(content, endIndex);

                        if (contentTypeMatch.Success && filenameMatch.Success)
                        {
                            var startIndex = contentTypeMatch.Index + contentTypeMatch.Length + "\r\n\r\n".Length;

                            endIndex = IndexOf(data, delimiterBytes, startIndex);

                            var contentLength = endIndex - startIndex;

                            if (contentLength > 0)
                            {
                                var fileData = new byte[contentLength];
                                var file = new MultipartFile();
                                file.ContentType = contentTypeMatch.Value.Trim();
                                file.Filename = filenameMatch.Value.Trim();

                                Buffer.BlockCopy(data, startIndex, fileData, 0, contentLength);

                                file.FileContents = fileData;
                                model.files.Add(file);
                            }
                            else
                            {
                                break;
                            }
                        }
                        else
                        {
                            break;
                        }
                    }
                    catch (Exception ex)
                    {
                        ex.DebugLog();

                        break;
                    }
                }

                result = true;
            }

            return result;
        }

        private static int IndexOf(byte[] searchWithin, byte[] serachFor, int startIndex)
        {
            int index = 0;
            int startPos = Array.IndexOf(searchWithin, serachFor[0], startIndex);

            if (startPos != -1)
            {
                while ((startPos + index) < searchWithin.Length)
                {
                    if (searchWithin[startPos + index] == serachFor[index])
                    {
                        index++;
                        if (index == serachFor.Length)
                        {
                            return startPos;
                        }
                    }
                    else
                    {
                        startPos = Array.IndexOf<byte>(searchWithin, serachFor[0], startPos + index);
                        if (startPos == -1)
                        {
                            return -1;
                        }
                        index = 0;
                    }
                }
            }

            return -1;
        }

        private static byte[] ToByteArray(Stream stream)
        {
            byte[] buffer = new byte[NetworkConstants.FILE_STREAM_BUFFER_SIZE];

            using (MemoryStream ms = new MemoryStream())
            {
                while (true)
                {
                    int read = stream.Read(buffer, 0, buffer.Length);

                    if (read <= 0)
                    {
                        return ms.ToArray();
                    }

                    ms.Write(buffer, 0, read);
                }
            }
        }

        public class MultipartModel
        {
            public List<MultipartFile> files;
        }

        public class MultipartFile
        {
            public string ContentType;
            public string Filename;
            public byte[] FileContents;
        }
    }
}
