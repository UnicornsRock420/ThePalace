using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;

namespace ThePalace.Server.Factories
{
    public partial class RoomBuilder : Packet, IDisposable, IReceiveProtocol, ISendProtocol
    {
        private void Flush(bool all = false)
        {
            passwordOfst = 0;
            roomNameOfst = 0;
            artistNameOfst = 0;
            hotspotOfst = 0;
            pictureOfst = 0;
            firstLProp = 0;
            firstDrawCmd = 0;
            nbrDrawCmds = 0;
            nbrHotspots = 0;
            nbrLProps = 0;
            nbrPictures = 0;
            base.Clear();

            if (all)
            {
                ID = 0;
                Name = null;
                Artist = null;
                Password = null;
                LooseProps.Clear();
                Pictures.Clear();
                DrawCommands.Clear();
                Hotspots.Clear();
            }
        }

        #region Serializer
        public void Deserialize(Packet inPacket = null)
        {
            NotifyPropertyChanged();
            //isDirty = true;
            HasUnsavedAuthorChanges = true;
            HasUnsavedChanges = true;

            if (inPacket != null)
            {
                Flush(true);
                _data = new List<byte>(inPacket.getData());
            }

            try
            {
                roomFlags = ReadSInt32();
                facesID = ReadSInt32();
                roomID = ReadSInt16();
                roomNameOfst = ReadSInt16();
                pictNameOfst = ReadSInt16();
                artistNameOfst = ReadSInt16();
                passwordOfst = ReadSInt16();
                nbrHotspots = ReadSInt16();
                hotspotOfst = ReadSInt16();
                nbrPictures = ReadSInt16();
                pictureOfst = ReadSInt16();
                nbrDrawCmds = ReadSInt16();
                firstDrawCmd = ReadSInt16();
                DropBytes(2); //nbrPeople
                nbrLProps = ReadSInt16();
                firstLProp = ReadSInt16();
                DropBytes(2);
                lenVars = ReadSInt16();

                // Get the strings
                roomName = PeekPString(32, roomNameOfst);
                roomPicture = PeekPString(32, pictNameOfst);
                roomArtist = PeekPString(32, artistNameOfst);
                roomPassword = PeekPString(32, passwordOfst);

                // Paint
                #region Paint

                for (int i = 0; i < nbrDrawCmds; i++)
                {
                    Seek(firstDrawCmd + i * DrawCmdRec.SizeOf);

                    var drawCmd = new DrawCmdRec();
                    drawCmd.nextOfst = PeekSInt16();
                    drawCmd.reserved = PeekSInt16();
                    drawCmd.drawCmd = PeekSInt16();
                    drawCmd.cmdLength = PeekUInt16();
                    drawCmd.dataOfst = PeekSInt16();
                    drawCmd.data = _data
                        .Skip(drawCmd.dataOfst)
                        .Take(drawCmd.cmdLength)
                        .ToArray();

                    _drawCmds.Add(drawCmd);
                }

                #endregion

                // Loose Props
                #region Loose Props
                for (int i = 0; i < nbrLProps; i++)
                {
                    Seek(firstLProp + i * LoosePropRec.SizeOf);

                    var prop = new LoosePropRec();
                    prop.nextOfst = PeekSInt16();
                    prop.reserved = PeekSInt16();

                    prop.propSpec = new AssetSpec();
                    prop.propSpec.id = PeekSInt32();
                    prop.propSpec.crc = (UInt32)PeekSInt32();
                    prop.flags = PeekSInt32();
                    prop.refCon = PeekSInt32();

                    prop.loc = new Point();
                    prop.loc.v = PeekSInt16();
                    prop.loc.h = PeekSInt16();

                    _looseProps.Add(prop);
                }
                #endregion

                // Pictures
                #region Pictures
                for (int i = 0; i < nbrPictures; i++)
                {
                    Seek(pictureOfst + PictureRec.SizeOf * i);

                    var picture = new PictureRec();
                    picture.refCon = PeekSInt32();
                    picture.picID = PeekSInt16();
                    picture.picNameOfst = PeekSInt16();
                    picture.transColor = PeekSInt16();
                    picture.reserved = PeekSInt16();

                    if (picture.picNameOfst > 0 && picture.picNameOfst < Count)
                    {
                        picture.name = PeekPString(32, picture.picNameOfst);

                        _pictures.Add(picture);
                    }

                }
                #endregion

                //Hotspots
                #region Hotspots

                for (int i = 0; i < nbrHotspots; i++)
                {
                    Seek(hotspotOfst + HotspotRec.SizeOf * i);

                    var hotspot = new HotspotRec
                    {
                        Vortexes = new List<Point>(),
                        states = new List<HotspotStateRec>(),
                    };
                    hotspot.scriptEventMask = PeekSInt32();
                    hotspot.flags = PeekSInt32();
                    hotspot.secureInfo = PeekSInt32();
                    hotspot.refCon = PeekSInt32();

                    hotspot.loc = new Point();
                    hotspot.loc.v = PeekSInt16();
                    hotspot.loc.h = PeekSInt16();

                    hotspot.id = PeekSInt16();
                    hotspot.dest = PeekSInt16();
                    hotspot.nbrPts = PeekSInt16();
                    hotspot.ptsOfst = PeekSInt16();
                    hotspot.type = (HotspotTypes)PeekSInt16();
                    hotspot.groupID = PeekSInt16();
                    hotspot.nbrScripts = PeekSInt16();
                    hotspot.scriptRecOfst = PeekSInt16();
                    hotspot.state = PeekSInt16();
                    hotspot.nbrStates = PeekSInt16();
                    hotspot.stateRecOfst = PeekSInt16();
                    hotspot.nameOfst = PeekSInt16();
                    hotspot.scriptTextOfst = PeekSInt16();
                    hotspot.alignReserved = PeekSInt16();

                    if (hotspot.nameOfst > 0 && hotspot.nameOfst < Count)
                    {
                        hotspot.name = PeekPString(32, hotspot.nameOfst);
                    }

                    if (hotspot.scriptTextOfst > 0 && hotspot.scriptTextOfst < Count)
                    {
                        hotspot.script = ReadCString(hotspot.scriptTextOfst);
                    }

                    if (hotspot.nbrPts > 0 && hotspot.ptsOfst > 0 && hotspot.ptsOfst < Count - (Point.SizeOf * hotspot.nbrPts))
                    {
                        for (int s = 0; s < hotspot.nbrPts; s++)
                        {
                            Seek(hotspot.ptsOfst + s * Point.SizeOf);

                            var p = new Point();
                            p.v = PeekSInt16();
                            p.h = PeekSInt16();

                            hotspot.Vortexes.Add(p);
                        }
                    }

                    for (int s = 0; s < hotspot.nbrStates; s++)
                    {
                        Seek(hotspot.stateRecOfst + s * HotspotStateRec.SizeOf);

                        var hs = new HotspotStateRec();
                        hs.pictID = PeekSInt16();
                        hs.reserved = PeekSInt16();

                        hs.picLoc = new Point();
                        hs.picLoc.v = PeekSInt16();
                        hs.picLoc.h = PeekSInt16();

                        hotspot.states.Add(hs);
                    }

                    _hotspots.Add(hotspot);
                }

                #endregion

            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }
        }


        public byte[] Serialize(object input = null)
        {
            using (var _blobData = new Packet())
            {
                Flush(); // Flush(true) will clear ALL data

                // ALIGN header
                _blobData.PadBytes(4);

                // Room Name
                roomNameOfst = (short)_blobData.Count;
                _blobData.WritePString(roomName ?? $"Room {roomID}", 32);

                // Artist Name
                artistNameOfst = (short)_blobData.Count;
                _blobData.WritePString(roomArtist ?? string.Empty, 32);

                pictNameOfst = (short)_blobData.Count;
                _blobData.WritePString(roomPicture ?? "clouds.gif", 32);

                // Password
                passwordOfst = (short)_blobData.Count;
                _blobData.WritePString(roomPassword ?? string.Empty, 32);

                //Start Spots

                using (var tmp = new Packet())
                {
                    if (_hotspots != null && _hotspots.Count > 0)
                    {
                        foreach (var spot in _hotspots)
                        {
                            // Buffer spot scripts

                            spot.scriptTextOfst = (short)_blobData.Count;
                            _blobData.WriteCString(spot.script ?? string.Empty);

                            //Buffer spot states
                            spot.nbrStates = (short)(spot?.states?.Count ?? 0);
                            spot.stateRecOfst = (short)((spot.nbrStates > 0) ? _blobData.Count : 0);

                            if (spot.nbrStates > 0)
                            {
                                foreach (var state in spot.states)
                                {
                                    _blobData.WriteInt16(state.pictID);
                                    _blobData.WriteInt16(state.reserved);
                                    _blobData.AppendBytes(state.picLoc?.Serialize() ?? new Point(0, 0).Serialize());
                                }
                            }

                            spot.ptsOfst = 0;

                            if (spot.Vortexes != null && spot.Vortexes.Count > 0)
                            {
                                spot.ptsOfst = (short)_blobData.Count;

                                foreach (Point point in spot.Vortexes)
                                {
                                    _blobData.AppendBytes(point.Serialize());
                                }
                            }

                            spot.nameOfst = (short)_blobData.Count;
                            _blobData.WritePString(spot.name ?? string.Empty, 32);

                            //Buffer spotrecs
                            tmp.WriteInt32(spot.scriptEventMask);
                            tmp.WriteInt32(spot.flags);
                            tmp.WriteInt32(spot.secureInfo);
                            tmp.WriteInt32(spot.refCon);
                            tmp.AppendBytes(spot.loc?.Serialize() ?? new Point(0, 0).Serialize());
                            tmp.WriteInt16(spot.id);
                            tmp.WriteInt16(spot.dest);
                            tmp.WriteInt16(spot.nbrPts);
                            tmp.WriteInt16(spot.ptsOfst);
                            tmp.WriteInt16((Int16)spot.type);
                            tmp.WriteInt16(spot.groupID);
                            tmp.WriteInt16(spot.nbrScripts);
                            tmp.WriteInt16(spot.scriptRecOfst);
                            tmp.WriteInt16(spot.state);
                            tmp.WriteInt16(spot.nbrStates);
                            tmp.WriteInt16(spot.stateRecOfst);
                            tmp.WriteInt16(spot.nameOfst);
                            tmp.WriteInt16(spot.scriptTextOfst);
                            tmp.WriteInt16(spot.alignReserved);
                        }
                    }

                    _blobData.PadBytes(4);

                    hotspotOfst = (short)(((nbrHotspots = (short)_hotspots.Count) > 0) ? _blobData.Count : 0);

                    _blobData.AppendBytes(tmp.getData());
                }

                //Start Pictures

                using (var tmp = new Packet())
                {
                    if (_pictures != null && _pictures.Count > 0)
                    {
                        foreach (var pict in _pictures)
                        {
                            pict.picNameOfst = (short)_blobData.Count;
                            _blobData.WritePString(pict.name, 32);

                            tmp.WriteInt32(pict.refCon);
                            tmp.WriteInt16(pict.picID);
                            tmp.WriteInt16(pict.picNameOfst);
                            tmp.WriteInt16(pict.transColor);
                            tmp.WriteInt16(pict.reserved);
                        }
                    }

                    pictureOfst = (short)(((nbrPictures = (short)_pictures.Count) > 0) ? _blobData.Count : 0);

                    _blobData.AppendBytes(tmp.getData());
                }


                // Start DrawCmds
                using (var tmp = new Packet())
                {
                    _blobData.PadBytes(4);
                    firstDrawCmd = (short)(((nbrDrawCmds = (short)_drawCmds.Count) > 0) ? _blobData.Count : 0);

                    using (var data = new Packet())
                    {
                        for (int i = 0; i < nbrDrawCmds; i++)
                        {
                            _drawCmds[i].cmdLength = (ushort)_drawCmds[i].data.Length;
                            _drawCmds[i].dataOfst = (short)(firstDrawCmd + data.Count + DrawCmdRec.SizeOf * nbrDrawCmds);
                            _drawCmds[i].nextOfst = (short)((i == nbrDrawCmds - 1) ? 0 : firstDrawCmd + tmp.Count + DrawCmdRec.SizeOf);

                            tmp.WriteInt16(_drawCmds[i].nextOfst);
                            tmp.WriteInt16(_drawCmds[i].reserved);
                            tmp.WriteInt16((short)_drawCmds[i].drawCmd);
                            tmp.WriteInt16(_drawCmds[i].cmdLength);
                            tmp.WriteInt16(_drawCmds[i].dataOfst);
                            data.AppendBytes(_drawCmds[i].data);
                        }
                        tmp.AppendBytes(data.getData());
                    }
                    _blobData.AppendBytes(tmp.getData());
                }

                // Start Loose Props

                nbrLProps = (short)_looseProps.Count;
                firstLProp = (short)((nbrLProps > 0) ? _blobData.Count : 0);

                for (int i = 0; i < nbrLProps; i++)
                {
                    var ofst = ((i == nbrLProps - 1) ? 0 : (firstLProp + ((i + 1) * LoosePropRec.SizeOf)));

                    _looseProps[i].nextOfst = (short)(ofst);
                    _blobData.AppendBytes(_looseProps[i].Serialize());
                }

                // Write Map Header
                {
                    lenVars = (short)_blobData.Count;

                    WriteInt32(roomFlags);              // Room Flags
                    WriteInt32(facesID);                // Default Face ID
                    WriteInt16(roomID);                 // The Rooms ID
                    WriteInt16((short)roomNameOfst);    // Room Name
                    WriteInt16((short)pictNameOfst);    // Background Image Offset
                    WriteInt16((short)artistNameOfst);  // Artist
                    WriteInt16((short)passwordOfst);    // Password
                    WriteInt16(nbrHotspots);            // Number of Hotspots
                    WriteInt16((short)hotspotOfst);     // Hotspot Offset
                    WriteInt16(nbrPictures);            // Number of Pictures
                    WriteInt16((short)pictureOfst);     // Pictures Offset
                    WriteInt16(nbrDrawCmds);            // Number of Draw Commands
                    WriteInt16((short)firstDrawCmd);    // Draw Command Offset
                    WriteInt16(0);                      // Number of People ( Obsolete )
                    WriteInt16(nbrLProps);              // Number of Props
                    WriteInt16((short)firstLProp);      // Loose Props Offset
                    WriteInt16(reserved);               // Reserved Padding
                    WriteInt16(lenVars);                // Length of Data Blob
                }

                _data.AddRange(_blobData.getData());

                return _data.ToArray();
            }

        }

        public void DeserializeJSON(string json)
        {

        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                roomID = ID,
            });
        }
        #endregion
    }
}
