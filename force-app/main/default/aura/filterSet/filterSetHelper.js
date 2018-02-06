({
    //
    //definition value for some reason is not a valid json, 
    //for example 
    //{
    //  expression : "..."
    //
    // should be
    //
    //{
    //  "expression" : "..."
    //
    // if this definition is not going to change we should look into JSON5 or relaxed-json library
    // 

    fixJSON: function (badJSON) {

        var fixedJSON = badJSON

            // Replace ":" with "@colon@" if it's between double-quotes
            .replace('/:\s*"([^"]*)"/g', function (match, p1) {
                return ': "' + p1.replace('/:/g', '@colon@') + '"';
            })

            // Replace ":" with "@colon@" if it's between single-quotes
            .replace('/:\s*\'([^\']*)\'/g', function (match, p1) {
                return ': "' + p1.replace('/:/g', '@colon@') + '"';
            })

            // Add double-quotes around any tokens before the remaining ":"
            .replace('/([\'"])?([a-z0-9A-Z_]+)([\'"])?\s*:/g', '"$2": ')

            // Turn "@colon@" back into ":"
            .replace('/@colon@/g', ':');

        return fixedJSON;
    }
})
