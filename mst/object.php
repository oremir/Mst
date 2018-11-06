<?php

$aget = $_GET;
$apost = $_POST;

if (isset($aget["uid"])):
    $uid = $aget["uid"];
    //$map = $aget["map"];
else:
    $uid = 0;
endif;

$type = $apost["type"];
$action = $apost["action"];
$obj_id = $apost["obj_id"];

include "inc.php";

$mysqli = new mysqli($address, $lname, $lpass, $ldb);

if ($mysqli->connect_error) {
    die('Nepodařilo se připojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

switch ($type) {
    case "chest":        
        switch ($action) {
            case "OPEN":
                
                $result = $mysqli->query("SELECT * FROM `objects` WHERE ID = '".$obj_id."'");

                if ($result->num_rows > 0) {
                    // output data of each row
                    while($row = $result->fetch_assoc()) {
                        $radek_l2 = date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["name"] . "|" . $row["type"] . "|M" . $row["on_map"]. "|OP" . $row["open"]. "|LV" . $row["live"].  "|Chest Open MAP|";

                        $open = $row["open"];
                        $live = $row["live"];
                        
                        if (($open == 0) && ($live == 1)) {
                            $object = $row["JSON"];
                            $sql = "UPDATE `objects` SET open = '".$uid."', time = '".time()."' WHERE ID = ".$obj_id;

                            if ($mysqli->query($sql) === TRUE) {
                                $radek_l2 =  $radek_l2 . "Record updated successfully\n";
                            } else {
                                $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                            }
                        } else {
                            $radek_l2 =  $radek_l2 . "Record is open or not alive\n";
                        }
                    }
                } else {
                    $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $usr_id . "|Chest Open MAP| 0 results\n";
                }





                break;
        } 
        break;
}

$path_log = "log.log";

$fp = FOpen($path_log, "a");
FPutS($fp,$radek_l2);
FClose($fp);

$vystup = array("usr_id" => $uid, "obj" => $apost);

echo json_encode($vystup);


?>