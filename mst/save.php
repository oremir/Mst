<?php

function zapis_souboru($x) {
  global $fp;

  FPutS($fp,$x);
}

function indexOfUsrID($usr_id,$objects) {
    $index = -1;
    Reset($objects);
    while(Current($objects)):
        $object = Current($objects);
        if ($object->usr_id == $usr_id):
            $index = Key($objects);
        endif;
    
        Next($objects);
    endwhile;
    
    return $index;
}

$aget = $_GET;
$apost = $_POST;

$usr_id = $aget["player"]["usr_id"];
$map_new_int = $aget["player"]["map"]["new_int"];
$user = $aget["player"];
$objects = $aget["objects"];

// -------------------------- test write postavy -------------------

$path_postavy = "./assets/postavy/postavy.json";

$postavy = json_decode(file_get_contents($path_postavy));

$i = indexOfUsrID($usr_id, $postavy);

if ($i != -1):
    $postavy[$i] = $user;
else:
    array_push($postavy, $user);
endif;

file_put_contents($path_postavy, json_encode($postavy));

// --------------------------- update pswd --------------------------

$path_postava = "./assets/postavy/pswd.php";

$fp = FOpen($path_postava, "r");

while(!FEof($fp)):
  $radek[] = FGetS($fp,250);
endwhile;

FClose($fp);

Reset($radek);
while(Current($radek)):
  if (StrStr(Current($radek),"//")):
    $ARadek = Explode(",",Current($radek));
    if ($ARadek[1] == $usr_id):
      $ARadek[4] = $map_new_int;
      $pom_radek = Implode(",",$ARadek);
      $radek_new[] = $pom_radek."\r\n";
    else:
      $radek_new[] = Current($radek);
    endif;
  else:
    $radek_new[] = Current($radek);
  endif;
  Next($radek);
endwhile;

$fp = FOpen($path_postava, "w");

Array_Walk($radek_new, "zapis_souboru");

FClose($fp);


// --------------------------- udate new map user --------------------



$path_map = "./assets/maps/map".$map_new_int.".json";

$map = json_decode(file_get_contents($path_map));

$aget["map1"] = $map;

$i = indexOfUsrID($usr_id, $map->objects);

$aget["map2"] = $i;

if ($i != -1):
    $map->objects[$i] = $user;
else:
    array_push($map->objects, $user);
endif;

$aget["map3"] = $map;

file_put_contents($path_map."1", json_encode($map));




/*$path_map = "./assets/maps/map".$map_new_int.".json";

$fp = FOpen($path_map, "r");

while(!FEof($fp)):
  $radek_map[] = FGetS($fp,250);
endwhile;

FClose($fp);

Reset($radek_map);
while(Current($radek_map)):
  if (StrStr(Current($radek_map),"objects")):
    $radek_map_new[] = Current($radek_map);
    $pom_radek = json_encode($user);
    $radek_map_new[] = $pom_radek."\r\n";
  else:
    $radek_map_new[] = Current($radek_map);
  endif;
  Next($radek_map);
endwhile;

$fp = FOpen($path_map, "w");

Array_Walk($radek_map_new, "zapis_souboru");

FClose($fp);*/



//echo json_encode($apost);
echo json_encode($aget);

//echo "<br>";

/*Reset($aget);
while(Current($aget)):
    echo Key($aget).": ".Current($aget)."<br>";
    Next($aget);
endwhile;*/
?>