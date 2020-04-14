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
$name = $apost["name"];

$radek_l2 = date(DATE_ATOM) . "|" . time() . "|" . $obj_id . "|" . $name . "|" . $type . "|" . $action . " ****\n";

include "inc.php";

$mysqli = new mysqli($address, $lname, $lpass, $ldb);

if ($mysqli->connect_error) {
    die('Nepodařilo se připojit k MySQL serveru (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}

$items = "";
$prop = array("items" => $items);
$object = array("properties" => $prop, "obj_id" => 0);
$status = "ok";

switch ($type) {
    case "chest":
        
        $result = $mysqli->query("SELECT * FROM `objects` WHERE ID = '".$obj_id."'");

        if ($result->num_rows > 0) {
            // output data of each row
            while($row = $result->fetch_assoc()) {
                $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["name"] . "|" . $row["type"] . "|M" . $row["on_map"]. "|OP" . $row["open"]. "|LV" . $row["live"].  "|Chest";

                $open = $row["open"];
                $live = $row["live"];
    
                switch ($action) {
                    case "OPEN":
                        $radek_l2 =  $radek_l2 . " Open|";
                        if ($live == 1) {
                            if ($open == 0 || $open == $uid) {
                                $object = json_decode($row["JSON"]);
                                $sql = "UPDATE `objects` SET open = '".$uid."', time = '".time()."' WHERE ID = ".$obj_id;

                                if ($mysqli->query($sql) === TRUE) {
                                    $radek_l2 =  $radek_l2 . "Record updated successfully\n";
                                } else {
                                    $status = "error";
                                    $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                                }
                            } else {
                                $status = "open";
                                $radek_l2 =  $radek_l2 . "Record is open\n";
                            }
                        } else {
                            $status = "dead";
                            $radek_l2 =  $radek_l2 . "Record is not alive\n";
                        }
                        break;
                    case "CLOSE":
                        $radek_l2 =  $radek_l2 . " Close|";
                        if ($live == 1) {
                            $object = $apost;
                            $new_obj = json_encode($apost);
                            $sql = "UPDATE `objects` SET JSON = '".$new_obj."', open = 0, time = '".time()."' WHERE ID = ".$obj_id;

                            if ($mysqli->query($sql) === TRUE) {
                                $radek_l2 =  $radek_l2 . "Record updated successfully\n";
                            } else {
                                $status = "error";
                                $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                            }
                        } else {
                            $status = "dead";
                            $radek_l2 =  $radek_l2 . "Record is not alive\n";
                        }
                        break;
                    case "GET":
                        $radek_l2 =  $radek_l2 . " Get|";
                        if ($live == 1) {
                            $sql = "UPDATE `objects` SET live = 0, time = '".time()."' WHERE ID = ".$obj_id;

                            if ($mysqli->query($sql) === TRUE) {
                                $radek_l2 =  $radek_l2 . "Record updated successfully\n";
                            } else {
                                $status = "error";
                                $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                            }
                        } else {
                            $status = "dead";
                            $radek_l2 =  $radek_l2 . "Record is not alive\n";
                        }
                        break;
                    default:
                        $status = "error";
                        $radek_l2 =  $radek_l2 . "|Unknown Action: ".$action."\n";
                } // --- end of switch ---
            } // --- end of while ---
        } else {
            $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $obj_id . "|Chest| 0 results\n";
            
            $object = $apost;
            $new_map_int = $apost["map_int"];
            
            $is_same = $mysqli->query("SELECT * FROM `objects` WHERE live = 1 and on_map = '".$new_map_int."' and name = '".$name."' and type = '".$type."'");
            
            if ($is_same->num_rows > 0) {
                $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|Chest dupl\n";
            } else {            
                $sel_dead = $mysqli->query("SELECT * FROM `objects` WHERE live = 0 ORDER BY ID ASC LIMIT 1");

                if ($sel_dead->num_rows < 1) {
                    $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|Chest dead| 0 results\n";

                    $sql = "INSERT INTO `objects` (name, type, on_map, open, live, time) 
                    VALUES ('".$name."', '".$type."', '".$new_map_int."', 0, 1, '".time()."')";

                    $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $name . "|" . $type . "|" . $new_map_int .  "|Chest INS|";

                    $last_id = 0;

                    if ($mysqli->query($sql) === TRUE) {
                        $last_id = $mysqli->insert_id;
                        $object["obj_id"] = $last_id;
                        $new_obj_id = $last_id;

                        $radek_l2 = $radek_l2 . "LastID:".$last_id."|New record created successfully";
                    } else {
                        $status = "error";
                        $radek_l2 = $radek_l2 . "Error: " . $sql . " | " . $mysqli->error . "\n";
                    }
                } else {
                    $row_dead = $sel_dead->fetch_assoc();

                    $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" .  $row_dead["ID"]. "|" . $row_dead["name"] . "|" . $row_dead["type"] . "|M" . $row_dead["on_map"]. "|OP" . $row_dead["open"]. "|LV" . $row_dead["live"].  "|Dead Chest";

                    $new_obj_id = $row_dead["ID"];
                    $object["obj_id"] = $new_obj_id;              
                }

                if ($new_obj_id > 0) {
                    $new_obj = json_encode($object);

                    $sql = "UPDATE `objects` SET on_map = '".$new_map_int."', name = '".$name."', type = '".$type."', JSON = '".$new_obj."', time = '".time()."', open = 0, live = 1 WHERE ID = ".$new_obj_id;

                    if ($mysqli->query($sql) === TRUE) {
                        $radek_l2 =  $radek_l2 . "|Record updated successfully\n";
                    } else {
                        $status = "error";
                        $object["obj_id"] = 0;
                        $radek_l2 =  $radek_l2 . "|Error updating record: " . $mysqli->error . "\n";
                    }  
                }
            }
        }
        break;
    default:
        $radek_l2 =  date(DATE_ATOM) . "|" . time() . "|" . "Object - Unknown Type of Object: ".$type."\n";
}

$path_log = "log.log";

$fp = FOpen($path_log, "a");
FPutS($fp,$radek_l2);
FClose($fp);

$vystup = array("usr_id" => $uid, "obj" => $object, "stat" => $status);

echo json_encode($vystup);


?>