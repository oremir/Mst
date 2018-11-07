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

$items = "";
$prop = array("items" => $items);
$object = array("properties" => $prop);

switch ($type) {
    case "chest":
        
        $result = $mysqli->query("SELECT * FROM `objects` WHERE ID = '".$obj_id."'");

        if ($result->num_rows > 0) {
            // output data of each row
            while($row = $result->fetch_assoc()) {
                $radek_l2 = date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["name"] . "|" . $row["type"] . "|M" . $row["on_map"]. "|OP" . $row["open"]. "|LV" . $row["live"].  "|Chest";

                $open = $row["open"];
                $live = $row["live"];
    
                switch ($action) {
                    case "OPEN":
                        $radek_l2 =  $radek_l2 . " Open|";
                        if (($open == 0) && ($live == 1)) {
                            $object = json_decode($row["JSON"]);
                            $sql = "UPDATE `objects` SET open = '".$uid."', time = '".time()."' WHERE ID = ".$obj_id;

                            if ($mysqli->query($sql) === TRUE) {
                                $radek_l2 =  $radek_l2 . "Record updated successfully\n";
                            } else {
                                $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                            }
                        } else {
                            $radek_l2 =  $radek_l2 . "Record is open or not alive\n";
                        }
                        break;
                    case "CLOSE":
                        $radek_l2 =  $radek_l2 . " Close|";
                        if ($live == 1) {
                            $object = json_decode($row["JSON"]);
                            $sql = "UPDATE `objects` SET open = 0, time = '".time()."' WHERE ID = ".$obj_id;

                            if ($mysqli->query($sql) === TRUE) {
                                $radek_l2 =  $radek_l2 . "Record updated successfully\n";
                            } else {
                                $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                            }
                        } else {
                            $radek_l2 =  $radek_l2 . "Record is not alive\n";
                        }
                        break; 
                    default:
                        $radek_l2 =  $radek_l2 . "|Unknown Action: ".$action."\n";
                } // --- end of switch ---
            }
        } else {
            $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $usr_id . "|Chest Open| 0 results\n";
        }
        break;
    default:
        $radek_l2 =  date(DATE_ATOM) . "|" . time() . "|" . "Object - Unknown Type of Object: ".$type."\n";
}

$path_log = "log.log";

$fp = FOpen($path_log, "a");
FPutS($fp,$radek_l2);
FClose($fp);

$vystup = array("usr_id" => $uid, "obj" => $object);

echo json_encode($vystup);


?>