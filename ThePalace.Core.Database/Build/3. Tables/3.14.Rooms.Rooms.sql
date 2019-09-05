IF NOT EXISTS(SELECT TOP 1 1 FROM SYS.TABLES WHERE OBJECT_ID = OBJECT_ID('[Rooms].[Rooms]')) BEGIN
	CREATE TABLE [Rooms].[Rooms](
		[RoomID] [smallint] NOT NULL,
		[Name] [nvarchar](1024) NOT NULL,
		[Flags] [int] NOT NULL,
		[CreateDate] [DATETIME] NOT NULL,
		[LastModified] [DATETIME] NULL,
		[MaxOccupancy] [smallint] NOT NULL DEFAULT 0,
		[OrderID] [smallint] NOT NULL DEFAULT 0,
	 CONSTRAINT [PK_Rooms] PRIMARY KEY CLUSTERED 
	(
		[RoomID] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	PRINT 'CREATED [Rooms].[Rooms]'
END ELSE BEGIN
	PRINT 'ALREADY EXISTS [Rooms].[Rooms]'
END
GO

IF NOT EXISTS(SELECT TOP 1 1 FROM SYS.COLUMNS WHERE OBJECT_ID = OBJECT_ID('[Rooms].[Rooms]') AND NAME = N'OrderID') BEGIN
	ALTER TABLE [Rooms].[Rooms] ADD OrderID [smallint] NULL
	EXEC('UPDATE [Rooms].[Rooms] SET OrderID = 0')
	ALTER TABLE [Rooms].[Rooms] ALTER COLUMN OrderID [smallint] NOT NULL

	PRINT 'ADD COLUMN [Rooms].[Rooms].[OrderID]'
END
GO
