<?php
header("Content-Type: text/html; charset=iso-8859-1");
function load_with_script_tag($filename) {
    $content = file_get_contents($filename);
    $load_tamper_tag = '<script type="text/javascript" src="http://tamper.test/Tamper_for_Anarchy_Blood_Bowl_League.user.js"></script></body>';
    if(strpos($content, $load_tamper_tag)===false) {
        $content = str_replace("</body>", $load_tamper_tag, $content);
    }
    echo $content;
}
if( $_GET['p'] && $_GET['p'] == 'ro') {
    if($_GET['t'] == 'loei') {
        load_with_script_tag('loei.html');
    }else if ($_GET['t'] == 'cri') {
        load_with_script_tag('cri.html');
    }else if ($_GET['t'] == 'ank') {
             load_with_script_tag('ank.html');
    }else if ($_GET['t'] == 'mot') {
            load_with_script_tag('mot.html');
        }
}else if ($_GET['p'] && $_GET['p'] == 'ans') {
    load_with_script_tag('purchase.html');
}else {
?>
<ul>
<li><a href="default.asp?p=ro&t=loei">loei team roster</a></li>
<li><a href="default.asp?p=ro&t=cri">cri team roster</a></li>
<li><a href="default.asp?p=ans&t=loei">purchase</a></li>
<?php
}