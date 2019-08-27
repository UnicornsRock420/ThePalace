var app = angular.module('ThePalace');

app.constant('ServerDownFlags', {
    SD_Unknown: 0,
    SD_LoggedOff: 1,
    SD_CommError: 2,
    SD_Flood: 3,
    SD_KilledByPlayer: 4,
    SD_ServerDown: 5,
    SD_Unresponsive: 6,
    SD_KilledBySysop: 7,
    SD_ServerFull: 8,
    SD_InvalidSerialNumber: 9,
    SD_DuplicateUser: 10,
    SD_DeathPenaltyActive: 11,
    SD_Banished: 12,
    SD_BanishKill: 13,
    SD_NoGuests: 14,
    SD_DemoExpired: 15,
    SD_Verbose: 16,
});

app.constant('RoomFlags', {
    RF_AuthorLocked: 0x0001,
    RF_Private: 0x0002,
    RF_NoPainting: 0x0004,
    RF_Closed: 0x0008,
    RF_CyborgFreeZone: 0x0010,
    RF_Hidden: 0x0020,
    RF_NoGuests: 0x0040,
    RF_WizardsOnly: 0x0080,
    RF_DropZone: 0x0100,
    RF_NoLooseProps: 0x0200,
});

app.constant('UserFlags', {
    UF_SuperUser: 0x01,
    UF_God: 0x02,
    UF_Kill: 0x04,
    UF_Guest: 0x08,
    UF_Banished: 0x10,
    UF_Penalized: 0x20,
    UF_CommError: 0x40,
    UF_Gag: 0x0080,
    UF_Pin: 0x0100,
    UF_Hide: 0x0200,
    UF_RejectESP: 0x0400,
    UF_RejectPrivate: 0x0800,
    UF_PropGag: 0x1000,
});

app.constant('HotSpotFlags', {
    HF_Draggable: 0x0001,
    HF_DontMoveHere: 0x0002,
    HF_Invisible: 0x0004,
    HF_ShowName: 0x0008,
    HF_ShowFrame: 0x0010,
    HF_Shadow: 0x0020,
    HF_Fill: 0x0040,
    HF_Forbidden: 0x0080,
    HF_Mandatory: 0x0100,
    HF_LandingPad: 0x0200,
});

app.constant('HotSpotTypes', {
    HS_Normal: 0x00,
    HS_Door: 0x01,
    HS_ShutableDoor: 0x02,
    HS_LockableDoor: 0x03,
    HS_Bolt: 0x04,
    HS_NavArea: 0x05,
});

app.constant('DrawCmdTypes', {
    DC_Path: 0x00,
    DC_Shape: 0x01,
    DC_Text: 0x02,
    DC_Detonate: 0x03,
    DC_Delete: 0x04,
    DC_Ellipse: 0x05,
});

app.constant('DrawCmdVariations', {
    V_Pencil: 0x00,
    V_FreePoly: 0x01,
});

app.constant('AssetTypes', {
    Prop: 0x50726F70,
    Userbase: 0x55736572,
    Ipuserbase: 0x49557372,
});

app.constant('ServerAssetFlags', {
    HighResProp: 0x01,
});

app.constant('PropFlags', {
    PF_Head: 0x02,
    PF_Ghost: 0x04,
    PF_Rare: 0x08,
    PF_Animate: 0x10,
    PF_Bounce: 0x20,
    PF_Palindrome: 0x40,
});

app.constant('HiResPropFlags', {
    PF_Head: 0x0200,
    PF_Ghost: 0x0400,
    PF_Animate: 0x1000,
    PF_Bounce: 0x2000,
});

app.constant('PropFormats', {
    PF_8Bit: 0x0,
    PF_16Bit: 0xFF80,
    PF_20Bit: 0x40,
    PF_32Bit: 0x100,
    PF_S20Bit: 0x200,
});

//#define LI_ULCAPS_ASSETS_PALACE		    0x00000001UL
//#define LI_ULCAPS_ASSETS_FTP			0x00000002UL
//#define LI_ULCAPS_ASSETS_HTTP		    0x00000004UL
//#define LI_ULCAPS_ASSETS_OTHER		    0x00000008UL
//#define LI_ULCAPS_FILES_PALACE		    0x00000010UL
//#define LI_ULCAPS_FILES_FTP			    0x00000020UL
//#define LI_ULCAPS_FILES_HTTP			0x00000040UL
//#define LI_ULCAPS_FILES_OTHER		    0x00000080UL

//#define LI_DLCAPS_ASSETS_PALACE		    0x00000001UL
//#define LI_DLCAPS_ASSETS_FTP		    0x00000002UL
//#define LI_DLCAPS_ASSETS_HTTP		    0x00000004UL
//#define LI_DLCAPS_ASSETS_OTHER		    0x00000008UL
//#define LI_DLCAPS_FILES_PALACE		    0x00000010UL
//#define LI_DLCAPS_FILES_FTP			    0x00000020UL
//#define LI_DLCAPS_FILES_HTTP			0x00000040UL
//#define LI_DLCAPS_FILES_OTHER		    0x00000080UL

//#define LI_2DENGINECAP_PALACE		    0x00000001UL

//#define LI_2DGRAPHCAP_GIF87			    0x00000001UL
//#define LI_2DGRAPHCAP_GIF89a			0x00000002UL
//#define LI_2DGRAPHCAP_JPG			    0x00000004UL
//#define LI_2DGRAPHCAP_TIFF			    0x00000008UL
//#define LI_2DGRAPHCAP_TARGA			    0x00000010UL
//#define LI_2DGRAPHCAP_BMP			    0x00000020UL
//#define LI_2DGRAPHCAP_PCT			    0x00000040UL

//#define LI_3DENGINECAP_VRML1			0x00000001UL
//#define LI_3DENGINECAP_VRML2			0x00000002UL
