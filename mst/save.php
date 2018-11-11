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
        if ($object->type == "player"):
            if ($object->usr_id == $usr_id):
                $index = Key($objects);
            endif;
        endif;
    
        Next($objects);
    endwhile;
    
    return $index;
}

$aget = $_GET;
$apost = $_POST;

$usr_id = $apost["player"]["usr_id"];
$map_new_int = $apost["player"]["map"]["new_int"];
$map_old_int = $apost["player"]["map"]["old_int"];
$user = $apost["player"];

if (isset($apost["objects"])):
    $objects = $apost["objects"];
else:
    $objects = array();
endif;

// -------------------------- open sql -----------------------------

include "inc.php";

$mysqli = new mysqli($address, $lname, $lpass, $ldb);

if ($mysqli->connect_error) {
    die('Nepodařilo se připojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$result = $mysqli->query("SELECT * FROM `users` WHERE UID = '".$usr_id."'");

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        $radek_l2 = date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["UID"]. "|" . $row["login_name"]. "|X" . $user["x"] . "|Y" . $user["y"] . "|" . $row["on_map"]. "|" . $map_new_int . "|SAVE|";
    }
    
    $sql = "UPDATE `users` SET on_map = '".$map_new_int."', JSON = '".json_encode($user)."', time = '".time()."' WHERE UID = ".$usr_id;

    if ($mysqli->query($sql) === TRUE) {
        $radek_l2 =  $radek_l2 . "Record updated successfully\n";
    } else {
        $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
    }
} else {
    $radek_l2 = date(DATE_ATOM) . "|" . time() . "|" . $usr_id . "| 0 results - SAVE\n";
}

// -------------------------- Update Objects -----------------------

$pobjects = $objects;
$ob_usr = array();
$ob_obj = array();

Reset($pobjects);
while(Current($pobjects)):
    $object = Current($pobjects);
    $pom = $object["type"];
    if ($object["type"] == "player"):
        if ($object["usr_id"] != $usr_id):
            $ob_usr[$usr_id] = $object;
        endif;
    else:
        if (isset($object["obj_id"])):
            $pom_id = $object["obj_id"];
            
            if ($pom_id != 0):
                $ob_obj[$pom_id] = $object;
            else:
                $index = Key($pobjects);

                $iname = $object["name"];
                $itype = $object["type"];

                

                $sql = "INSERT INTO `objects` (name, type, on_map, open, live, time) 
                VALUES ('".$iname."', '".$itype."', '".$map_old_int."', 0, 1, '".time()."')";

                $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $row["name"] . "|" . $row["type"]  . $row["on_map"].  "|OBJ INS|";

                $last_id = 0;

                if ($mysqli->query($sql) === TRUE) {
                    $last_id = $mysqli->insert_id;
                    $objects[$index]["obj_id"] = $last_id;
                    $ob_obj[$last_id] = $object;

                    $radek_l2 = $radek_l2 . "LastID:".$last_id."| New record created successfully.\n";
                } else {
                    $radek_l2 = $radek_l2 . "Error: " . $sql . " | " . $mysqli->error . "\n";
                }
            endif;
        else:
            $index = Key($pobjects);

            $iname = $object["name"];
            $itype = $object["type"];

            $sql = "INSERT INTO `objects` (name, type, on_map, open, live, time) 
            VALUES ('".$iname."', '".$itype."', '".$map_old_int."', 0, 1, '".time()."')";

            $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $row["name"] . "|" . $row["type"]  . $row["on_map"].  "|OBJ INS|";

            $last_id = 0;

            if ($mysqli->query($sql) === TRUE) {
                $last_id = $mysqli->insert_id;
                $objects[$index]["obj_id"] = $last_id;
                $ob_obj[$last_id] = $object;

                $radek_l2 = $radek_l2 . "LastID:".$last_id."| New record created successfully.\n";
            } else {
                $radek_l2 = $radek_l2 . "Error: " . $sql . " | " . $mysqli->error . "\n";
            }

//            if ($last_id != 0) {
//                $sql = "UPDATE `objects` SET JSON = '".json_encode($objects[$index])."' WHERE ID = ".$last_id;
//
//                if ($mysqli->query($sql) === TRUE) {
//                    $radek_l2 =  $radek_l2 . " | Record updated successfully\n";
//                } else {
//                    $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
//                }
//            }
        endif;
    endif;

    Next($pobjects);
endwhile;

$result = $mysqli->query("SELECT * FROM `objects` WHERE on_map = '".$map_old_int."'");

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["name"] . "|" . $row["type"] . "|" . $row["on_map"].  "|OBJ SAVE|";
        
        $obj_id = $row["ID"];
        $object = $ob_obj[$obj_id];
        $sql = "UPDATE `objects` SET on_map = '".$map_old_int."', JSON = '".json_encode($object)."', time = '".time()."' WHERE ID = ".$obj_id;

        if ($mysqli->query($sql) === TRUE) {
            $radek_l2 =  $radek_l2 . "Record updated successfully\n";
        } else {
            $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
        }
    }
} else {
    $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" . $usr_id . "|MAP-OBJ 0 results - SAVE\n";
}

$path_log = "log.log";

$fp = FOpen($path_log, "a");
FPutS($fp,$radek_l2);
FClose($fp);

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


//$map_old_int = (int)filter_var ( $path_map_old, FILTER_SANITIZE_STRING);

$path_map = "./assets/maps/map".$map_new_int.".json";
$path_map_old = "./assets/maps/map".$map_old_int.".json";

if ((int)$map_new_int != $map_old_int):

// --------------------------- udate old map --------------------


  $map = json_decode(file_get_contents($path_map_old));

  $apost["map old"] = $map;

  $map->objects = $objects;

  $apost["map4"] = $map;

  file_put_contents($path_map_old, json_encode($map));


// --------------------------- udate new map user --------------------



  $map = json_decode(file_get_contents($path_map));

  $apost["map1"] = $map;

  $i = indexOfUsrID($usr_id, $map->objects);

  $apost["map2"] = $i;

  if ($i != -1):
      $map->objects[$i] = $user;
  else:
      array_push($map->objects, $user);
  endif;

  $apost["map3"] = $map;

  file_put_contents($path_map, json_encode($map));

else:

// --------------------------- udate same map user --------------------



  $map = json_decode(file_get_contents($path_map));

  $apost["map1"] = $map;

  $i = indexOfUsrID($usr_id, $map->objects);

  $apost["map2"] = $i;

  if ($i != -1):
      $map->objects[$i] = $user;
  else:
      array_push($map->objects, $user);
  endif;

  $apost["map3"] = $map;

  file_put_contents($path_map, json_encode($map));

endif;

echo json_encode($apost);
?>