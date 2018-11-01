<?php
$aget = $_GET;
$apost = $_POST;

$jmeno = $aget["user"];
$heslo = $aget["pass"];

$path_log = "mesto.log";

$fp = FOpen($path_log, "a");

$radek_l = time() . "|" . $jmeno . "\n";

FPutS($fp,$radek_l);
//FPutS($fp,json_encode($apost));

FClose($fp);




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
      $map = Trim($ARadek[4]);
    endif;
  endif;
  Next($radek);
endwhile;

$vystup = array("usr_id" => $usr_id, "map" => $map);

echo json_encode($vystup);

// ---------------------------------------------------------------------------------

$mysqli = new mysqli('127.0.0.1', 'root', '', 'mst');

if ($mysqli->connect_error) {
    die('Nepodařilo se připojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$result = $mysqli->query("SELECT * FROM `users` WHERE login_name = '".$jmeno."'");

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        $radek_l2 = time() . "|" .  $row["ID"]. "|" . $row["UID"]. "|" . $row["login_name"]. "|" . $row["on_map"]. "\n";
        $suid = $row["UID"];
        $smap = $row["on_map"];
    }
} else {
    $radek_l2 = time() . "|" . $jmeno . "| 0 results ";
    $suid = 0;
}

if ($suid == 0) {
    $radek_l2 = $radek_l2. "| INS\n";
    
    $sql = "INSERT INTO users (UID, login_name, on_map, password)
    VALUES ('".$usr_id."', '".$jmeno."', '".$map."', '".$heslo."')";

    if ($mysqli->query($sql) === TRUE) {
        $radek_l2 = $radek_l2. "New record created successfully\n";
    } else {
        $radek_l2 = $radek_l2. "Error: " . $sql . "<br>" . $mysqli->error . "\n";
    }
}

$mysqli->close();

$path_log = "log.log";

$fp = FOpen($path_log, "a");

FPutS($fp,$radek_l2);

FClose($fp);

//echo "<br>";

/*Reset($aget);
while(Current($aget)):
    echo Key($aget).": ".Current($aget)."<br>";
    Next($aget);
endwhile;*/
?>
