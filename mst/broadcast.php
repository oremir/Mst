<?php

function zapis_souboru($x) {
  global $fp;

  FPutS($fp,$x);
}

if (!empty($_GET)):
  //echo $_GET;
  if (isset($_GET["ins"])) $ins = $_GET["ins"];
  if (isset($_GET["snt"])) $snt = $_GET["snt"];
endif;

//echo $ins;

if (!isset($ins)) $ins = "";
if (!isset($snt)) $snt = 0;

$path = "./assets/postavy/brddata.php";

if ($snt > 0):
  $fp = FOpen($path, "r");

  while(!FEof($fp)):
    $radek[] = FGetS($fp,500);
  endwhile;
  
  Reset($radek);
  while(Current($radek)):
    $radek_new[] = Current($radek);
	$radek_z = SubStr(Current($radek),2);
	$arad = explode("|",$radek_z);
	
	if ($arad[0] == $snt):
	 $bcst[] = $radek_z;
	endif;
	
	//echo $radek_z;
    Next($radek);
  endwhile;

  FClose($fp);

  $fp = FOpen($path, "w");

  Array_Walk($radek_new, "zapis_souboru");

  FClose($fp);
  
  echo json_encode($bcst);
  
endif;

if ($ins != ""):
	$fp = FOpen($path, "a");
	
	FPutS($fp,"//".$ins.PHP_EOL);
	
	FClose($fp);
endif;

?>