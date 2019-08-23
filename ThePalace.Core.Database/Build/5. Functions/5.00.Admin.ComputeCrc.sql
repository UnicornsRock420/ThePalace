IF EXISTS(SELECT TOP 1 1 FROM SYS.ALL_OBJECTS WHERE OBJECT_ID = OBJECT_ID('[Admin].[ComputeCrc]')) BEGIN
	DROP FUNCTION [Admin].[ComputeCrc]

	PRINT 'DROPPING [Admin].[ComputeCrc]'
END
PRINT 'Creating [Admin].[ComputeCrc]'
GO
CREATE FUNCTION [Admin].[ComputeCrc]
(
	@Data [varbinary](max),
	@Offset INT,
	@isAsset [bit]
)
RETURNS INT
AS
	EXTERNAL NAME [ThePalace.SqlFunctions].[Cipher].[ComputeCrc]
GO
