<HTML>
<HEAD>
<TITLE>V�pis u�ivatel�</TITLE>
</HEAD>
<BODY>
<H1>V�pis u�ivatel�</H1>
<?php
$mysqli = new mysqli('localhost', 'strj', 'str1', 'mst');

if ($mysqli->connect_error) {
    die('Nepoda�ilo se p�ipojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$vysledek = $mysqli->query("SELECT * FROM `users`");
echo 'Z datab�ze jsme z�skali ' . $vysledek->num_rows . ' u�ivatel�.';

while ($uzivatel = $vysledek->fetch_assoc())
{
  printf("%s %s \n", $uzivatel['ID'], $uzivatel['UID'], $uzivatel['login_name'], $uzivatel['on_map']);
}
$vysledek->free_result();


$mysqli->close();
?>

</BODY>
</HTML>