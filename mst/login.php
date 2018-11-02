<?php
$aget = $_GET;
$apost = $_POST;

$jmeno = $aget["user"];
$heslo = $aget["pass"];

$path_log = "mesto.log";

$fp = FOpen($path_log, "a");
$radek_l = date(DATE_ATOM) . "|" . time() . "|" . $jmeno . "\n";
FPutS($fp,$radek_l);
FClose($fp);

// ---------------------------------------------------------------------------------

include "inc.php";

$usr_id = "0";
$map = "0";

$mysqli = new mysqli($address, $lname, $lpass, 'mst');

if ($mysqli->connect_error) {
    die('Nepodařilo se připojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$result = $mysqli->query("SELECT ID, UID, login_name, on_map, password FROM `users` WHERE login_name = '".$jmeno."'");

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        $radek_l2 = date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["UID"]. "|" . $row["login_name"]. "|" . $row["on_map"]. "\n";
        if (($row["login_name"] == $jmeno)&&($row["password"] == $heslo)):        
            $usr_id = $row["UID"];
            $map = $row["on_map"];
        else:
            $radek_l2 = date(DATE_ATOM) . "|" . time() . "|" . $jmeno . "| Wrong password\n";
        endif;
    }
} else {
    $radek_l2 = date(DATE_ATOM) . "|" . time() . "|" . $jmeno . "| 0 results | INS\n";
    
    // ---------------------------------------------------------------------------------
    
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
        if (($ARadek[2] == $jmeno)&&(Trim($ARadek[3]) == $heslo)):
          $usr_id = $ARadek[1];
          $map = Trim($ARadek[4]);
        endif;
      endif;
      Next($radek);
    endwhile;
    
    // ---------------------------------------------------------------------------------
    
    $sql = "INSERT INTO users (UID, login_name, on_map, password)
    VALUES ('".$usr_id."', '".$jmeno."', '".$map."', '".$heslo."')";

    if ($mysqli->query($sql) === TRUE) {
        $radek_l2 = $radek_l2. "New record created successfully\n";
    } else {
        $radek_l2 = $radek_l2. "Error: " . $sql . "<br>" . $mysqli->error . "\n";
    }
}

$path_log = "log.log";

$fp = FOpen($path_log, "a");
FPutS($fp,$radek_l2);
FClose($fp);

$mysqli->close();

$vystup = array("usr_id" => $usr_id, "map" => $map);

echo json_encode($vystup);

?>
