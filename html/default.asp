<?php
header("Content-Type: text/html; charset=iso-8859-1");

if( $_GET['p'] && $_GET['p'] == 'ro') {
    if($_GET['t'] == 'loei') {
        require('loei.html');
    }else if ($_GET['t'] == 'cri') {
        require('cri.html');
    }
    echo "hello";
}else if ($_GET['p'] && $_GET['p'] == 'ans') {
    require('purchase.html');
}else {
?>
<ul>
<li><a href="default.asp?p=ro&t=loei">loei team roster</a></li>
<li><a href="default.asp?p=ro&t=cri">cri team roster</a></li>
<li><a href="default.asp?p=ans&t=loei">purchase</a></li>
<?php
}