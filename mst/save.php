<?php

function zapis_souboru($x) {
  global $fp;

  FPutS($fp,$x);
}

$aget = $_GET;
$apost = $_POST;

$usr_id = $aget["usr_id"];
$map = $aget["map"]["new_int"];
$user = $aget;

// -------------------------- test write postavy -------------------

$path_log = "./assets/postavy/postavy.json";

$fp = FOpen($path_log, "w");

FPutS($fp,json_encode($user));
//FPutS($fp,json_encode($apost));

FClose($fp);

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
      $ARadek[4] = $map;
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

// --------------------------- udate map user --------------------

$path_map = "./assets/maps/map".$map.".json";

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

FClose($fp);



//echo json_encode($apost);
echo json_encode($aget);

//echo "<br>";

/*Reset($aget);
while(Current($aget)):
    echo Key($aget).": ".Current($aget)."<br>";
    Next($aget);
endwhile;*/
?>