<?php

function indexOfUsrID($usr_id,$objects) {
    $index = -1;
    Reset($objects);
    while(Current($objects)):
        $object = Current($objects);
        if ($object->usr_id == $usr_id):
            $index = Key($objects);
        endif;
    
        Next($objects);
    endwhile;
    
    return $index;
}

$path_map = "./assets/maps/map3.json";

$map = json_decode(file_get_contents($path_map));

//$i = array_search('3', $map->objects->usr_id); -- Nefunguje


$i = indexOfUsrID(3, $map->objects);


$object_new = $map->objects[1]; // předá odkaz (ačkoliv by nemělo)

array_push($map->objects, $object_new);

$map->objects[2]->usr_id = 5;

//unset($map->objects[0]); // -- v poli se objeví indexy

print_r($map->objects);

file_put_contents('x.json', json_encode($map));

/*if ($i > -1):
    echo json_encode($map->objects[$i]);
else:
    echo $i;
endif;*/



?>