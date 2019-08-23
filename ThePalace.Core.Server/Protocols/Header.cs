using Newtonsoft.Json;
using System;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    public struct Header : IReceiveProtocol, ISendProtocol
    {
        [JsonProperty]
        public string eventType;

        [JsonIgnore]
        public UInt32 eventNbr;

        [JsonIgnore]
        public UInt32 length;

        [JsonProperty]
        public Int32 refNum;

        [JsonProperty]
        public string message;

        public Header(Header header)
        {
            eventType = header.eventType;
            eventNbr = header.eventNbr;
            length = header.length;
            refNum = header.refNum;
            message = header.message;
        }

        public void Deserialize(Packet packet)
        {
            eventNbr = packet.ReadUInt32();
            length = packet.ReadUInt32();
            refNum = packet.ReadSInt32();

            try
            {
                eventType = ((EventTypes)eventNbr).ToString();
            }
            catch { }
        }

        public byte[] Serialize(object input = null)
        {
            return Serialize(null);
        }

        public byte[] Serialize(byte[] append)
        {
            using (var packet = new Packet())
            {
                var evtType = eventNbr;

                if (evtType == 0)
                {
                    try
                    {
                        evtType = (uint)(EventTypes)Enum.Parse(typeof(EventTypes), eventType);
                    }
                    catch { }
                }

                packet.WriteInt32(evtType);
                packet.WriteInt32(length);
                packet.WriteInt32(refNum);

                if (append != null)
                {
                    packet.AppendBytes(append);
                }

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            this = JsonConvert.DeserializeObject<Header>(json);
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(this);
        }

        public static int SizeOf
        {
            get
            {
                return 12;
            }
        }
    }
}
