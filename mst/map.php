<?php

$aget = $_GET;

if (isset($aget["uid"])):
    $uid = $aget["uid"];
else:
    $uid = 0;
endif;

if (isset($aget["mapi"])):
    $map_int = $aget["mapi"];
    $path_map = "./assets/maps/map".$map_int.".json";
else:
    $map_int = 0;
endif;

if ($map_int != 0):
    $map = json_decode(file_get_contents($path_map));

    echo json_encode($map);
else:
    echo "Error map_int";
endif;
?>