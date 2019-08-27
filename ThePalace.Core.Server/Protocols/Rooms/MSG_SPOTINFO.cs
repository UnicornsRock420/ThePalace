using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;

namespace ThePalace.Server.Protocols
{
    [Description("ofNs")]
    public struct MSG_SPOTINFO : IReceiveProtocol
    {
        public List<PictureRec> pictureList;
        public HotspotRec spot;
        public Int16 roomID;

        public void Deserialize(Packet packet)
        {
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            pictureList = new List<PictureRec>();

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                roomID = jsonResponse.roomID;

                spot = new HotspotRec();
                spot.id = (Int16)jsonResponse.spotID;
                spot.type = (HotspotTypes)(short)jsonResponse.type;
                spot.state = (Int16)jsonResponse.state;
                spot.name = jsonResponse.name;
                spot.script = jsonResponse.script;
                spot.dest = (Int16)jsonResponse.dest;
                spot.flags = (Int32)jsonResponse.flags;

                spot.loc = new Point((Int16)jsonResponse.loc.h, (Int16)jsonResponse.loc.v);

                spot.states = new List<HotspotStateRec>();

                foreach (var state in jsonResponse.states)
                {
                    spot.states.Add(new HotspotStateRec
                    {
                        pictID = (Int16)state.pictID,
                        picLoc = new Point((Int16)state.picLoc.h, (Int16)state.picLoc.v),
                    });
                }

                foreach (var picture in jsonResponse.pictureList)
                {
                    pictureList.Add(new PictureRec
                    {
                        picID = (Int16)picture.picID,
                        name = picture.name,
                        transColor = (Int16)picture.transColor,
                    });
                }
            }
            catch
            {
            }
        }
    }
}
