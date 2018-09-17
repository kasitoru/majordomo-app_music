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
			$this->redirect('?');
		}
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
		// Config
		$out['terminal'] = $this->config['terminal'];
		$out['skin'] = $this->config['skin'];
		/*
		global $ajax;
		if(!empty($ajax)) {
			global $command;
			$json = array('error'=>0, 'message'=>NULL, 'data'=>NULL);
			switch($command) {
				case 'get_volume':
					// FIXME
					break;
				case 'get_playlist':
					global $id;
					if($collection = SQLSelectOne('SELECT `PATH` FROM `collections` WHERE `ID` = '.intval($id))) {
						if($tracks = $this->scanDirectory($collection['PATH'])) {
							$json['data'] = $tracks;
						} else {
							$json['error'] = TRUE;
							$json['message'] = 'Can\'t get playlist!';
						}
					} else {
						$json['error'] = TRUE;
						$json['message'] = 'Unknown ID!';
					}
					break;
				default:
					$json['error'] = TRUE;
					$json['message'] = 'Unknown command!';
			}
			die(json_encode($json));
		} else {
			$collections = SQLSelect("SELECT * FROM `collections` ORDER BY `TITLE`");
			$out['COLLECTIONS'] = $collections;
		}
		*/
	}

	// Install
	function install($parent_name='') {
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
