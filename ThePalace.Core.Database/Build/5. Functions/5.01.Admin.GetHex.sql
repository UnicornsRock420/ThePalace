IF EXISTS(SELECT TOP 1 1 FROM SYS.ALL_OBJECTS WHERE OBJECT_ID = OBJECT_ID('[Admin].[GetHex]')) BEGIN
	DROP FUNCTION [Admin].[GetHex]

	PRINT 'DROPPING [Admin].[GetHex]'
END
PRINT 'Creating [Admin].[GetHex]'
GO
CREATE FUNCTION [Admin].[GetHex]
(
	@Source INT
)
RETURNS NVARCHAR(MAX)
AS
	EXTERNAL NAME [ThePalace.SqlFunctions].[Utility].[GetHex]
GO
