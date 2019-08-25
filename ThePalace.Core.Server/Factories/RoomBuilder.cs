using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Drawing;
using System.IO;
using ThePalace.Core.Database;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;

namespace ThePalace.Server.Factories
{

    public partial class RoomBuilder : Packet, IDisposable, IReceiveProtocol, ISendProtocol
    {
        #region Members
        // Data Mappings
        private Int32 roomFlags;
        //public Int32 serverRoomFlags;
        private Int32 facesID;
        private Int16 roomID;
        private Int16 roomNameOfst;
        private Int16 pictNameOfst;
        private Int16 artistNameOfst;
        private Int16 passwordOfst;
        private Int16 nbrHotspots;
        private Int16 hotspotOfst;
        private Int16 nbrPictures;
        private Int16 pictureOfst;
        private Int16 nbrDrawCmds;
        private Int16 firstDrawCmd;
        //private Int16 nbrPeople;
        private Int16 nbrLProps;
        private Int16 firstLProp;
        private Int16 reserved;
        private Int16 lenVars;

        // Accessible strings and data
        private string roomName;
        private string roomPicture;
        private string roomArtist;
        private string roomPassword;
        private Int16 roomMaxOccupancy;
        private bool roomNotFound;
        private Int32 _height;
        private Int32 _width;
        public bool HasUnsavedAuthorChanges = false;

        // Collections
        private List<HotspotRec> _hotspots;
        private List<PictureRec> _pictures;
        private List<DrawCmdRec> _drawCmds;
        private List<LoosePropRec> _looseProps;
        #endregion

        #region Properties
        public List<HotspotRec> Hotspots
        {
            get => _hotspots;
            set
            {
                _hotspots = value;
                NotifyPropertyChanged(nameof(Hotspots));
            }
        }
        public List<PictureRec> Pictures
        {
            get => _pictures;
            set
            {
                _pictures = value;
                NotifyPropertyChanged(nameof(Pictures));
            }
        }
        public List<DrawCmdRec> DrawCommands
        {
            get => _drawCmds;
            set
            {
                _drawCmds = value;
                NotifyPropertyChanged(nameof(DrawCommands));
            }
        }

        public List<LoosePropRec> LooseProps
        {
            get => _looseProps;
            set
            {
                _looseProps = value;
                NotifyPropertyChanged(nameof(LooseProps));
            }
        }

        public string Name
        {
            get => roomName;
            set
            {
                if (roomName != value)
                {
                    roomName = value;
                    NotifyPropertyChanged(nameof(Name));
                }
            }
        }

        public string Picture
        {
            get => roomPicture;
            set
            {
                if (roomPicture != value)
                {
                    _height = 0;
                    _width = 0;

                    roomPicture = value;
                    NotifyPropertyChanged(nameof(Picture));
                }
            }
        }

        public string Artist
        {
            get => roomArtist;
            set
            {
                if (roomArtist != value)
                {
                    roomArtist = value;
                    NotifyPropertyChanged(nameof(Artist));
                }
            }
        }

        public string Password
        {
            get => roomPassword;
            set
            {
                if (roomPassword != value)
                {
                    roomPassword = value;
                    NotifyPropertyChanged(nameof(Password));
                }
            }
        }

        public Int16 ID
        {
            get => roomID;
            set
            {
                if (roomID != value)
                {
                    roomID = (Int16)value;
                    NotifyPropertyChanged(nameof(ID));
                }
            }
        }

        public Int16 MaxOccupancy
        {
            get => roomMaxOccupancy;
            set
            {
                if (roomMaxOccupancy != (Int16)value)
                {
                    roomMaxOccupancy = (Int16)value;
                    NotifyPropertyChanged(nameof(MaxOccupancy));
                }
            }
        }

        public Int32 Flags
        {
            get
            {
                return roomFlags;
            }
            set
            {
                if (roomFlags != value)
                {
                    roomFlags = value;
                    NotifyPropertyChanged(nameof(Flags));
                }
            }
        }

        public Int32 FacesID
        {
            get
            {
                return facesID;
            }
            set
            {
                if (facesID != value)
                {
                    facesID = value;
                    NotifyPropertyChanged(nameof(FacesID));
                }
            }
        }

        public bool NotFound
        {
            get
            {
                return roomNotFound;
            }
            private set
            {
                roomNotFound = value;
            }
        }

        public Int32 Width
        {
            get
            {
                if (_width > 0)
                {
                    return _width;
                }
                else if (!string.IsNullOrWhiteSpace(roomPicture))
                {
                    var path = Path.Combine(Environment.CurrentDirectory, "Media", roomPicture);

                    if (File.Exists(path))
                    {
                        using (var image = Image.FromFile(path))
                        {
                            if (image.Width > 0)
                            {
                                _width = image.Width;
                            }
                        }
                    }

                    if (_width < 512)
                    {
                        _width = 512;
                    }

                    return _width;
                }
                else
                {
                    return 512;
                }
            }
        }

        public Int32 Height
        {
            get
            {
                if (_height > 0)
                {
                    return _height;
                }
                else if (!string.IsNullOrWhiteSpace(roomPicture))
                {
                    var path = Path.Combine(Environment.CurrentDirectory, "Media", roomPicture);

                    if (File.Exists(path))
                    {
                        using (var image = Image.FromFile(path))
                        {
                            if (image.Height > 0)
                            {
                                _height = image.Height;
                            }
                        }
                    }

                    if (_height < 384)
                    {
                        _height = 384;
                    }

                    return _height;
                }
                else
                {
                    return 384;
                }
            }
        }
        #endregion

        #region Constructor

        public RoomBuilder() : base()
        {
            _hotspots = new List<HotspotRec>();
            _pictures = new List<PictureRec>();
            _drawCmds = new List<DrawCmdRec>();
            _looseProps = new List<LoosePropRec>();
            isDirty = false;
        }

        public RoomBuilder(IEnumerable<byte> data) : base(data)
        {
            _hotspots = new List<HotspotRec>();
            _pictures = new List<PictureRec>();
            _drawCmds = new List<DrawCmdRec>();
            _looseProps = new List<LoosePropRec>();
            isDirty = false;
        }

        public RoomBuilder(Packet packet) : base()
        {
            _data = new List<byte>(packet.getData());

            _hotspots = new List<HotspotRec>();
            _pictures = new List<PictureRec>();
            _drawCmds = new List<DrawCmdRec>();
            _looseProps = new List<LoosePropRec>();
            isDirty = false;
        }

        public RoomBuilder(Int16 RoomID) : base()
        {
            _hotspots = new List<HotspotRec>();
            _pictures = new List<PictureRec>();
            _drawCmds = new List<DrawCmdRec>();
            _looseProps = new List<LoosePropRec>();
            isDirty = false;

            ID = RoomID;
        }

        public void Dispose()
        {
            base.Dispose();

            _hotspots.Clear();
            _looseProps.Clear();
            _drawCmds.Clear();
            _pictures.Clear();
            _hotspots = null;
            _looseProps = null;
            _drawCmds = null;
            _pictures = null;
        }

        #endregion

        public void Peek(ThePalaceEntities dbContext)
        {
            if (ThePalace.Core.Factories.RoomData.Peek(dbContext, ID, out RoomRec roomData))
            {
                roomFlags = roomData.roomFlags;
                roomName = roomData.roomName;
                roomMaxOccupancy = roomData.roomMaxOccupancy;
                LastModified = roomData.roomLastModified;
                roomNotFound = roomData.roomNotFound;
            }
            else
            {
                roomNotFound = true;
            }
        }

        public void Read(ThePalaceEntities dbContext)
        {
            try
            {
                if (ThePalace.Core.Factories.RoomData.ReadRoom(dbContext, ID, out RoomRec roomData))
                {
                    roomFlags = roomData.roomFlags;
                    roomName = roomData.roomName;
                    roomMaxOccupancy = roomData.roomMaxOccupancy;
                    LastModified = roomData.roomLastModified;
                    roomNotFound = roomData.roomNotFound;

                    facesID = roomData.facesID;
                    roomPicture = roomData.roomPicture;
                    roomArtist = roomData.roomArtist;
                    roomPassword = roomData.roomPassword;

                    ThePalace.Core.Factories.RoomData.ReadHotspots(dbContext, ID, out _hotspots);
                    ThePalace.Core.Factories.RoomData.ReadPictures(dbContext, ID, out _pictures);
                    ThePalace.Core.Factories.RoomData.ReadLooseProps(dbContext, ID, out _looseProps);
                    ThePalace.Core.Factories.RoomData.ReadDrawCmds(dbContext, ID, out _drawCmds);

                    isDirty = false;
                }
                else
                {
                    roomNotFound = true;
                }
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }

            HasUnsavedAuthorChanges = false;
        }

        public void Write(ThePalaceEntities dbContext)
        {
            try
            {
                ThePalace.Core.Factories.RoomData.WriteRoom(dbContext, ID, new RoomRec
                {
                    roomFlags = roomFlags,
                    roomName = roomName,
                    roomMaxOccupancy = roomMaxOccupancy,
                    roomLastModified = LastModified,
                    roomNotFound = roomNotFound,

                    facesID = facesID,
                    roomPicture = roomPicture,
                    roomArtist = roomArtist,
                    roomPassword = roomPassword,
                });

                var sqlParam1 = new SqlParameter("roomID", ID);
                var sqlParam2 = new SqlParameter("hasUnsavedAuthorChanges", HasUnsavedAuthorChanges);
                dbContext.Database.ExecuteSqlCommand("EXEC Rooms.FlushExtendedRoomDetails @roomID, @hasUnsavedAuthorChanges", sqlParam1, sqlParam2);

                if (HasUnsavedAuthorChanges)
                {
                    lock (_hotspots)
                    {
                        ThePalace.Core.Factories.RoomData.WriteHotspots(dbContext, ID, _hotspots);
                    }

                    lock (_pictures)
                    {
                        ThePalace.Core.Factories.RoomData.WritePictures(dbContext, ID, _pictures);
                    }
                }

                lock (_looseProps)
                {
                    ThePalace.Core.Factories.RoomData.WriteLooseProps(dbContext, ID, _looseProps);
                }

                lock (_drawCmds)
                {
                    ThePalace.Core.Factories.RoomData.WriteDrawCmds(dbContext, ID, _drawCmds);
                }

                if (dbContext.HasUnsavedChanges())
                {
                    dbContext.SaveChanges();
                }

                AcceptChanges();
            }
            catch (Exception ex)
            {
                ex.DebugLog();
                AcceptChanges();
            }

            HasUnsavedAuthorChanges = false;
        }
    }
}
