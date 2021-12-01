<?php

$aget = $_GET;
$apost = $_POST;

if (isset($aget["uid"])):
    $uid = $aget["uid"];
    //$map = $aget["map"];
else:
    $uid = 0;
endif;

if (isset($apost["string"])):
    $string = $apost["string"];
else:
    $string = "";
    $week = 0;
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
                                $object = json_decode($row["JSON"]);
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
                            $taken = $apost["properties"]["taken"];
                            $object = $apost;
                            $new_obj = json_encode($apost);
                            $sql = "UPDATE `objects` SET JSON = '".$new_obj."', open = 0, time = '".time()."' WHERE ID = ".$obj_id;

                            if ($mysqli->query($sql) === TRUE) {
                                $radek_l2 =  $radek_l2 . $taken. "|Record updated successfully\n";
                            } else {
                                $status = "error";
                                $radek_l2 =  $radek_l2 . $taken. "|Error updating record: " . $mysqli->error . "\n";
                            }
                        } else {
                            $status = "dead";
                            $radek_l2 =  $radek_l2 . $taken. "|Record is not alive\n";
                        }
                        break;
                    case "GET":
                        $radek_l2 =  $radek_l2 . " Get|";
                        if ($live == 1) {
                            $taken = $apost["properties"]["taken"];
                            $sql = "UPDATE `objects` SET live = 0, time = '".time()."' WHERE ID = ".$obj_id;

                            if ($mysqli->query($sql) === TRUE) {
                                $radek_l2 =  $radek_l2 . $taken. "|Record updated successfully\n";
                            } else {
                                $status = "error";
                                $radek_l2 =  $radek_l2 . $taken. "|Error updating record: " . $mysqli->error . "\n";
                            }
                        } else {
                            $status = "dead";
                            $radek_l2 =  $radek_l2 . $taken. "|Record is not alive\n";
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
        
    case "follower":
        
        $result = $mysqli->query("SELECT * FROM `objects` WHERE ID = '".$obj_id."'");

        if ($result->num_rows > 0) {
            // output data of each row
            while($row = $result->fetch_assoc()) {
                $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["name"] . "|" . $row["type"] . "|M" . $row["on_map"]. "|OP" . $row["open"]. "|LV" . $row["live"].  "|Follower";
    
                switch ($action) {
                    case "SAVE":                        
                        $radek_l2 =  $radek_l2 . " Save|";
                        $apost["type"] = $apost["properties"]["ftype"];
                        $new_map_int = $apost["map_int"];
                        $object = $apost;
                        $new_obj = json_encode($apost);
                        $sql = "UPDATE `objects` SET JSON = '".$new_obj."', on_map = '".$new_map_int."', time = '".time()."' WHERE ID = ".$obj_id;

                        if ($mysqli->query($sql) === TRUE) {
                            $radek_l2 =  $radek_l2 . "Record updated successfully\n";
                        } else {
                            $status = "error";
                            $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                        }
                        break;
                } // --- end of switch ---
            } // --- end of while ---
        } else {
            $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $obj_id . "|Follower| 0 results\n";
        }
        break;
        
    case "NPC":
        
        $result = $mysqli->query("SELECT * FROM `objects` WHERE ID = '".$obj_id."'");

        if ($result->num_rows > 0) {
            // output data of each row
            while($row = $result->fetch_assoc()) {
                $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["name"] . "|" . $row["type"] . "|M" . $row["on_map"]. "|OP" . $row["open"]. "|LV" . $row["live"].  "|NPC";
    
                switch ($action) {
                    case "SAVE":                        
                        $radek_l2 =  $radek_l2 . " Save|";
                        $new_map_int = $apost["map_int"];
                        $object = $apost;
                        $new_obj = json_encode($apost);
                        $sql = "UPDATE `objects` SET JSON = '".$new_obj."', on_map = '".$new_map_int."', time = '".time()."' WHERE ID = ".$obj_id;

                        if ($mysqli->query($sql) === TRUE) {
                            $radek_l2 =  $radek_l2 . "Record updated successfully\n";
                        } else {
                            $status = "error";
                            $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                        }
                        break;
                } // --- end of switch ---
            } // --- end of while ---
        } else {
            $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $obj_id . "|Follower| 0 results\n";
        }
        break;
        
    case "player":
        
        $result = $mysqli->query("SELECT * FROM `users` WHERE UID = '".$uid."'");

        if ($result->num_rows > 0) {
            // output data of each row
            while($row = $result->fetch_assoc()) {
                $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" .  $row["UID"]. "|" . $row["login_name"] . "|M" . $row["on_map"]. "|Player";
    
                switch ($action) {
                    case "LOAD":                        
                        $status = "open";
                        $object = json_decode($row["JSON"]);
                        $radek_l2 =  $radek_l2 . "|Load\n";
                        break;
                } // --- end of switch ---
            } // --- end of while ---
        } else {
            $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $obj_id . "|Follower| 0 results\n";
        }
        break;
        
    case "stream":
        
        $result = $mysqli->query("SELECT * FROM `objects` WHERE ID = '1'");

        if ($result->num_rows > 0) {
            // output data of each row
            while($row = $result->fetch_assoc()) {
                $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $string;
                $object = json_decode($row["JSON"]);
                $s = $object->s;
                $s1 = (array)$s;
                $s1[$uid] = $string;
                $s2 = array();
                
                $gt = $object->gtime;
                $gtime = (int)$gt;
                //echo($gtime);
                $r_arr = explode("|", $string);
                //echo($r_arr[2]);
                $gtimenew = (int)substr($r_arr[2], 0, -3);
                //echo($gtimenew);

                if ($gtime > $gtimenew) {
                    $gtimenew = $gtime;
                }
                
                foreach($s1 as $rows1) {
                    //echo($rows1);
                    $r_arr = explode("|", $rows1);
                    $time1 = substr($r_arr[1], 1, -3);
                    $time2 = (int)$time1 + 3600;
                    $gtimen = (int)substr($r_arr[2], 0, -3);
                    //echo($gtimenew);
                    //echo($gtimen);
                    if ($time2 > time()) {
                        $s2[$r_arr[0]] = $rows1;
                    }
                    
                    if ($gtimen > $gtimenew) {
                        $gtimenew = $gtimen;
                    }
                }
                $object->gtime = $gtimenew;
                
                $object->s = (object)$s2;
    
                switch ($action) {
                    case "STREAM":                   
                        $new_obj = json_encode($object);
                        
                        $sql = "UPDATE `objects` SET JSON = '".$new_obj."', time = '".time()."' WHERE ID = '1'";

                        if ($mysqli->query($sql) === TRUE) {
                            $radek_l2 =  $radek_l2 . "|Record updated successfully\n";
                        } else {
                            $status = "error";
                            $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                        }
                        break;
                } // --- end of switch ---
            } // --- end of while ---
        }
        break;
        
    case "ftprint":
        
        $result = $mysqli->query("SELECT * FROM `objects` WHERE ID = '".$obj_id."'");

        if ($result->num_rows > 0) {
            // output data of each row
            while($row = $result->fetch_assoc()) {
                $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $string;
                $object = json_decode($row["JSON"]);
                $cases = $object->properties->cases;
                $cases1 = (array)$cases;
                $cid = $apost["properties"]["cid"];
                $ftprint_new = $apost["ftprint"];
                $witness_new = $apost["witness"];
                $new_map_int = $apost["map_int"];
                
                foreach($cases1 as $case1) {
                    if ($case1->CID == $cid) {
                        $ftprints = $case1->ftprints;
                        $ftprints1 = (array)$ftprints;
                        $ftpl = count($ftprints1);
                        $ftprints1[$ftpl] = $ftprint_new;
                        //array_push($ftprints1, $ftprint_new);
                        $case1->ftprints = (object)$ftprints1;
                        
                        if ($witness_new !== "") {
                            $witness = $case1->witness;
                            
                            //echo json_encode($witness);
                            
                            $lid = $case1->witness->lid;
                            $witness1 = (array)$witness;
                            $lid1 = (int)$lid;
                            
                            //echo in_array($map_int, $witness1);
                            
                            if (!in_array($new_map_int, $witness1)) {
                                $lid1++;
                                $witness_new["id"] = $lid1;
                                $witness1["lid"] = $lid1;
                                $witness1[$new_map_int] = $witness_new;
                                $case1->witness = (object)$witness1;
                            }
                        }
                    }
                }
                
                $object->properties->cases = (object)$cases1;
                
                switch ($action) {
                    case "FTPRINT":                   
                        $new_obj = json_encode($object);
                        
                        $sql = "UPDATE `objects` SET JSON = '".$new_obj."', time = '".time()."' WHERE ID = '".$obj_id."'";

                        if ($mysqli->query($sql) === TRUE) {
                            $radek_l2 =  $radek_l2 . "|Record updated successfully\n";
                        } else {
                            $status = "error";
                            $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
                        }
                        break;
                } // --- end of switch ---
            } // --- end of while ---
        }
        break;

    default:
        $radek_l2 =  date(DATE_ATOM) . "|" . time() . "|" . "Object - Unknown Type of Object: ".$type."\n";
}

$path_log = "log.log";

$fp = FOpen($path_log, "a");
FPutS($fp,$radek_l2);
FClose($fp);

$vystup = array("usr_id" => $uid, "obj" => $object, "stat" => $status, "time" => time());

echo json_encode($vystup);


?>