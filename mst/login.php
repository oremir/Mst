<?php
$aget = $_GET;
$apost = $_POST;

$path_log = "mesto.log";

$fp = FOpen($path_log, "w");

FPutS($fp,json_encode($aget));
//FPutS($fp,json_encode($apost));

FClose($fp);


$jmeno = $aget["user"];
$heslo = $aget["pass"];

$path_postava = "./assets/postavy/pswd.php";

$fp = FOpen($path_postava, "r");

while(!FEof($fp)):
  $radek[] = FGetS($fp,250);
endwhile;

FClose($fp);

$usr_id = "0";
$map = "0";

Reset($radek);
while(Current($radek)):
  if (StrStr(Current($radek),"//")):
    $ARadek = Explode(",",Current($radek));
    if (($ARadek[2] == $jmeno)&&(Trim($ARadek[3]) == $heslo)):
      $usr_id = $ARadek[1];
      $map = $ARadek[4];
    endif;
  endif;
  Next($radek);
endwhile;

$vystup = array("usr_id" => $usr_id, "map" => $map);


//echo json_encode($apost);
echo json_encode($vystup);

//echo "<br>";

/*Reset($aget);
while(Current($aget)):
    echo Key($aget).": ".Current($aget)."<br>";
    Next($aget);
endwhile;*/
?>
