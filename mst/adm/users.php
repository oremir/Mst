<HTML>
<HEAD>
<TITLE>Výpis uživatelù</TITLE>
</HEAD>
<BODY>
<H1>Výpis uživatelù</H1>
<?php
$mysqli = new mysqli('localhost', 'strj', 'str1', 'mst');

if ($mysqli->connect_error) {
    die('Nepodaøilo se pøipojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$vysledek = $mysqli->query("SELECT * FROM `users`");
echo 'Z databáze jsme získali ' . $vysledek->num_rows . ' uživatelù.';

while ($uzivatel = $vysledek->fetch_assoc())
{
  printf("%s %s \n", $uzivatel['ID'], $uzivatel['UID'], $uzivatel['login_name'], $uzivatel['on_map']);
}
$vysledek->free_result();


$mysqli->close();
?>

</BODY>
</HTML>