SET SCHEMA kweaver;

INSERT INTO "configuration" ("key","value","type")
SELECT 'digital_human', '1', '12'
FROM DUAL WHERE NOT EXISTS(SELECT "key" FROM "configuration" WHERE "key" = 'digital_human' );
