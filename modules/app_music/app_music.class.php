<?php
/*
	Music Player for MajorDoMo
	Author: Sergey Avdeev <thesoultaker48@gmail.com>
	URL: https://github.com/thesoultaker48/majordomo-app_music
*/

class app_music extends module {
	
	// Constructor
	function app_music() {
		$this->name = 'app_music';
		$this->title = 'Музыкальный плеер';
		$this->module_category = '<#LANG_SECTION_APPLICATIONS#>';
		$this->checkInstalled();
	}

	// saveParams
	function saveParams($data=0) {
		$p = array();
		if(isset($this->id)) {
			$p['id'] = $this->id;
		}
		if(isset($this->view_mode)) {
			$p['view_mode'] = $this->view_mode;
		}
		if(isset($this->edit_mode)) {
			$p['edit_mode'] = $this->edit_mode;
		}
		if(isset($this->tab)) {
			$p['tab'] = $this->tab;
		}
		return parent::saveParams($p);
	}

	// getParams
	function getParams() {
		global $id, $mode, $view_mode, $edit_mode, $tab;
		if(isset($id)) {
			$this->id = $id;
		}
		if(isset($mode)) {
			$this->mode = $mode;
		}
		if(isset($view_mode)) {
			$this->view_mode = $view_mode;
		}
		if(isset($edit_mode)) {
			$this->edit_mode = $edit_mode;
		}
		if(isset($tab)) {
			$this->tab = $tab;
		}
	}

	// run
	function run() {
		global $session;
		$out = array();
		$this->getConfig();
		if($this->action == 'admin') {
			$this->admin($out);
		} else {
			$this->usual($out);
		}
		if(isset($this->owner->action)) {
			$out['PARENT_ACTION'] = $this->owner->action;
		}
		if(isset($this->owner->name)) {
			$out['PARENT_NAME']=$this->owner->name;
		}
		$out['ID'] = $this->id;
		$out['VIEW_MODE'] = $this->view_mode;
		$out['EDIT_MODE'] = $this->edit_mode;
		$out['MODE'] = $this->mode;
		$out['ACTION'] = $this->action;
		$this->data = $out;
		$p = new parser(DIR_TEMPLATES.$this->name.'/'.$this->name.'.html', $this->data, $this);
		$this->result = $p->result;
	}

	// BackEnd
	function admin(&$out) {
		// Save action
		if($this->edit_mode == 'save') {
			global $terminal, $skin;
			$this->config['terminal'] = $terminal;
			$this->config['skin'] = $skin;
			$this->saveConfig();
			// Redirect
			$this->redirect('?ok');
		}
		// Alerts
		global $ok, $error;
		if(isset($ok)) $out['OK'] = '<#LANG_DATA_SAVED#>';
		if(isset($error)) $out['ERROR'] = '<#LANG_FILLOUT_REQURED#>';
		// Terminal
		$out['terminal'] = $this->config['terminal'];
		$terminals = SQLSelect('SELECT `NAME`, `TITLE` FROM `terminals` ORDER BY `TITLE`');
		if($terminals[0]['NAME']) {
			foreach($terminals as $terminal) {
				$out['TERMINALS'][] = $terminal;
			}
		}
		// Skins
		$out['skin'] = $this->config['skin'];
		$skins = scandir(DIR_TEMPLATES.$this->name.'/skins');
		if(is_array($skins)) {
			foreach($skins as $skin) {
				$skin = DIR_TEMPLATES.$this->name.'/skins/'.$skin;
				if(is_dir($skin) && file_exists($skin.'/index.html')) {
					$out['SKINS'][] = array('NAME' => basename($skin));
				}
			}
		}
	}

	// Scan directory for audio files
	/*
	function scanDirectory($directory, $results=array()) {
		if($dir = openDir($directory)) {
			while($file = readDir($dir)) {
				if(($file == '.') || ($file=='..')) {
					continue;
				}
				if(Is_Dir($directory.'/'.$file)) {
					$results = $this->scanDirectory($directory.'/'.$file, $results);
				} else {
					if(in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), array('mp3'))) {
						$results[] = $directory.'/'.$file;
					}
				}
			}
			closeDir($dir);
		}
		asort($results);
		return $results;
	}
	*/

	// FrontEnd
	function usual(&$out) {
		global $ajax, $command, $param;
		if(isset($ajax)) {
			// JSON default
			$json = array(
				'command'			=> $command,
				'success'			=> FALSE,
				'message'			=> NULL,
				'data'				=> NULL,
			);
			// Command
			switch($command) {
				case 'check_cover': // Check cover
					if(strlen($param)>0) {
						include_once('getid3/getid3.php');
						$getid3 = new getID3;
						$param = urldecode($param);
						$param = str_replace('file:///', '', $param);
						$info = $getid3->analyze($param);
						if(!isset($info['error'])) {
							$json['success'] = TRUE;
							$json['message'] = 'OK';
							if(isset($info['id3v2']['APIC'][0])) {
								$json['data'] = TRUE;
							} else {
								$json['data'] = FALSE;
							}
						} else {
							$json['success'] = FALSE;
							$json['message'] = implode('; ', $info['error']);
						}
					} else {
						$json['success'] = FALSE;
						$json['message'] = 'Input is missing!';
					}
					break;
				case 'get_cover': // Get cover
					if(strlen($param)>0) {
						include_once('getid3/getid3.php');
						$getid3 = new getID3;
						$param = urldecode($param);
						$param = str_replace('file:///', '', $param);
						$info = $getid3->analyze($param);
						if(!isset($info['error'])) {
							if(isset($info['id3v2']['APIC'][0])) {
								header('Content-Type: '.$info['id3v2']['APIC'][0]['image_mime']);
								header('Content-Length: '.$info['id3v2']['APIC'][0]['datalength']);
								die($info['id3v2']['APIC'][0]['data']);
							} else {
								$json['success'] = FALSE;
								$json['message'] = 'The file does not contain the cover!';
							}
						} else {
							$json['success'] = FALSE;
							$json['message'] = implode('; ', $info['error']);
						}
					} else {
						$json['success'] = FALSE;
						$json['message'] = 'Input is missing!';
					}
					break;
				default: // Unknown
					$json['success'] = FALSE;
					$json['message'] = 'Unknown command!';
			}
			die(json_encode($json));
		} else {
			// Config
			$out['terminal'] = (isset($this->terminal)?$this->terminal:$this->config['terminal']);
			$out['skin'] = (isset($this->skin)?$this->skin:$this->config['skin']);
		}
	}

	// Install
	function install($parent_name='') {
		$this->getConfig();
		$this->config['terminal'] = '';
		$this->config['skin'] = 'rtone1_audioUI';
		$this->saveConfig();
		parent::install($parent_name);
	}

	// Uninstall
	function uninstall() {
		parent::uninstall();
	}

	// dbInstall
	function dbInstall($data) {
		parent::dbInstall($data);
	}

}

?>
