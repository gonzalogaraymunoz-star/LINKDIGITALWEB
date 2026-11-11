<?php
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
set_time_limit(180);
$account='/home/u265708824';$backups=$account.'/_raices_og_backup_20261111';$done=$account.'/_raices_og_done_20261111.json';
if(is_file($done)){echo file_get_contents($done);exit;}
$report=['updated'=>[],'images'=>[],'skipped'=>[],'errors'=>[]];
function oldmeta($s,$n){$p='~<meta\b[^>]*(?:name|property)\s*=\s*["\']'.preg_quote($n,'~').'["\'][^>]*>~i';if(!preg_match($p,$s,$a))return '';return preg_match('~content\s*=\s*(["\'])(.*?)\1~is',$a[0],$b)?html_entity_decode($b[2],ENT_QUOTES|ENT_HTML5,'UTF-8'):'';}
function esc($s){return htmlspecialchars($s,ENT_QUOTES|ENT_HTML5,'UTF-8');}
function makejpg($root,$url,$slug,$domain,&$r){
 $path=parse_url($url,PHP_URL_PATH);$bytes=false;$p=realpath($root.$path);$imgroot=realpath($root.'/imagenes');
 if($p&&$imgroot&&str_starts_with($p,$imgroot.'/'))$bytes=@file_get_contents($p);
 if(!$bytes&&str_starts_with($url,'https://thumb.wikimedia.org/')){$ctx=stream_context_create(['http'=>['timeout'=>4,'user_agent'=>'RaicesAtacamaOG/1.0']]);$bytes=@file_get_contents($url,false,$ctx);}
 if(!$bytes||strlen($bytes)>9000000||!function_exists('imagecreatefromstring'))return null;
 $src=@imagecreatefromstring($bytes);if(!$src)return null;$sw=imagesx($src);$sh=imagesy($src);
 if($sw<230||$sh<150){imagedestroy($src);return null;}
 $dir=$root.'/imagenes/social';if(!is_dir($dir)&&!@mkdir($dir,0755,true)){imagedestroy($src);return null;}
 $dest=$dir.'/'.$slug.'.jpg';$tmp=$dest.'.tmp';$im=imagecreatetruecolor(1200,630);$ratio=max(1200/$sw,630/$sh);$w=(int)ceil($sw*$ratio);$h=(int)ceil($sh*$ratio);
 imagecopyresampled($im,$src,(int)floor((1200-$w)/2),(int)floor((630-$h)/2),0,0,$w,$h,$sw,$sh);imageinterlace($im,true);$ok=@imagejpeg($im,$tmp,80);
 if($ok&&filesize($tmp)>350000)$ok=@imagejpeg($im,$tmp,72);
 imagedestroy($src);imagedestroy($im);if(!$ok||!@rename($tmp,$dest)){@unlink($tmp);return null;}
 $r['images'][]=['domain'=>$domain,'slug'=>$slug,'bytes'=>filesize($dest),'source'=>"$sw x $sh"];
 return 'https://'.$domain.'/imagenes/social/'.$slug.'.jpg';
}
foreach([['raicesdeatacama.cl','es_CL','es'],['raicesdeatacamabrasil.com.br','pt_BR','pt']] as [$domain,$locale,$lang]){
 $root="$account/domains/$domain/public_html";$files=glob($root.'/catalogo/*/index.html');$files[]=$root.'/catalogo/index.html';$files[]=$root.'/index.html';sort($files);
 foreach($files as $file){if(!is_file($file))continue;$rel=substr($file,strlen($root)+1);$s=@file_get_contents($file);
 if(!$s||!str_contains($s,'</head>')||!str_contains($s,'Raíces')){$report['skipped'][]="$domain/$rel BAD_HTML";continue;}
 $title=oldmeta($s,'og:title');if(!$title&&preg_match('~<title[^>]*>(.*?)</title>~is',$s,$m))$title=html_entity_decode(strip_tags($m[1]),ENT_QUOTES|ENT_HTML5,'UTF-8');
 if(!$title){$report['skipped'][]="$domain/$rel NO_TITLE";continue;}
 $desc=oldmeta($s,'og:description')?:oldmeta($s,'description');if(!$desc)$desc=$lang==='es'?'Explora las experiencias de Raíces de Atacama.':'Explore as experiências de Raíces de Atacama.';
 if(strlen($desc)<98&&str_contains($rel,'catalogo/')&&$rel!=='catalogo/index.html')$desc=rtrim($desc," .").'. '.($lang==='es'?'Descubre más con Raíces de Atacama.':'Descubra mais com a Raíces de Atacama.');
 $slug=$rel==='index.html'?'inicio':($rel==='catalogo/index.html'?'catalogo':basename(dirname($rel)));$route=$rel==='index.html'?'/':($rel==='catalogo/index.html'?'/catalogo/':'/catalogo/'.$slug.'/');$url='https://'.$domain.$route;
 $oldimg=oldmeta($s,'og:image')?:'https://'.$domain.'/imagenes/atacama-camino-hero.webp';$img=makejpg($root,$oldimg,$slug,$domain,$report);
 if(!$img){$report['skipped'][]="$domain/$slug IMAGE_NOT_CONVERTED";$img=str_replace('https://blue-dragonfly-288499.hostingersite.com/','https://'.$domain.'/',$oldimg);}
 $parts=preg_split('~</head>~i',$s,2);$head=$parts[0];$head=preg_replace('~<meta\b(?=[^>]*\b(?:property|name)\s*=\s*["\'](?:og:|twitter:)[^"\']*["\'])[^>]*>~i','',$head);
 $head=preg_replace('~<link\b(?=[^>]*\brel\s*=\s*["\']canonical["\'])[^>]*>~i','',$head);
 $data=['og:type'=>'website','og:site_name'=>'Raíces de Atacama','og:locale'=>$locale,'og:title'=>$title,'og:description'=>$desc,'og:url'=>$url,'og:image'=>$img,'og:image:secure_url'=>$img,'og:image:alt'=>$title];
 if(str_contains($img,'/imagenes/social/')){$data['og:image:type']='image/jpeg';$data['og:image:width']='1200';$data['og:image:height']='630';}
 foreach($data as $k=>$v)$head.="\n".'<meta property="'.esc($k).'" content="'.esc($v).'">';
 foreach(['twitter:card'=>'summary_large_image','twitter:title'=>$title,'twitter:description'=>$desc,'twitter:image'=>$img] as $k=>$v)$head.="\n".'<meta name="'.esc($k).'" content="'.esc($v).'">';
 $head.="\n".'<link rel="canonical" href="'.esc($url).'">';$updated=$head.'</head>'.$parts[1];
 $backup="$backups/$domain/$rel";@mkdir(dirname($backup),0750,true);
 if(!is_file($backup)&&@file_put_contents($backup,$s)!==strlen($s)){$report['errors'][]="$domain/$rel BACKUP_FAILED";continue;}
 $tmp=$file.'.og-tmp';if(@file_put_contents($tmp,$updated)!==strlen($updated)||!@rename($tmp,$file)){$report['errors'][]="$domain/$rel WRITE_FAILED";@unlink($tmp);continue;}
 $report['updated'][]=['url'=>$url,'image'=>$img];
 }
}
$report['updated_count']=count($report['updated']);$report['generated_count']=count($report['images']);$report['error_count']=count($report['errors']);
$json=json_encode($report,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);if(!$report['errors'])@file_put_contents($done,$json);echo $json;
