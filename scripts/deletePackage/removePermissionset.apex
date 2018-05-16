ID stratcraftPermissionSetId = [SELECT Id FROM PermissionSet WHERE Name = 'stratcraft' LIMIT 1].Id;
delete [SELECT Id 
        FROM PermissionSetAssignment 
        WHERE PermissionSetId = :stratcraftPermissionSetId];