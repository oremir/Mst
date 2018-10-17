function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

$(document).ready(function() {
    var data_core;
    var kstr = findGetParameter("kstr");
    var uid = findGetParameter("uid");
    
    $.getJSON("adm.php?kstr="+kstr+"&uid="+uid, function(data) {
        console.log(data);
        data_core = data;
    });
    
});