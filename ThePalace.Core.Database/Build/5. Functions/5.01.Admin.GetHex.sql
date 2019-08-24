IF EXISTS(SELECT TOP 1 1 FROM SYS.ALL_OBJECTS WHERE OBJECT_ID = OBJECT_ID('[Admin].[GetHex]')) BEGIN
	DROP FUNCTION [Admin].[GetHex]

	PRINT 'Dropping [Admin].[GetHex]'
END
GO

IF EXISTS(SELECT TOP 1 1 FROM SYS.ASSEMBLY_FILES WHERE NAME = 'ThePalace.SqlFunctions') BEGIN
	EXEC (N'CREATE FUNCTION [Admin].[GetHex](
		@Source INT
	) RETURNS NVARCHAR(MAX)
	AS EXTERNAL NAME [ThePalace.SqlFunctions].[Utility].[GetHex]')

	PRINT N'Created [Admin].[GetHex]'
END
GO