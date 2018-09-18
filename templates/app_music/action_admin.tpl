<div class="alert alert-info"><strong>Информация:</strong> Данный модуль работает только на alpha-ветке MajorDoMo! Подробную информацию по обновлению вы можете получить <a href="https://majordomo.smartliving.ru/forum/viewtopic.php?f=7&t=3569" target="_blank"><u>здесь</u></a>.</div>
<form action="?" method="post" class="form-horizontal">
	{if $OK}<div class="alert alert-success">{$OK}</div>{/if}
	{if $ERROR}<div class="alert alert-danger">{$ERROR}</div>{/if}
	<fieldset>
		<div class="form-group">
			<label class="col-lg-3 control-label">Терминал:</label>
			<div class="col-lg-5">
				<select name="terminal" class="form-control">
					<option value=""{if $terminal == ''} selected{/if}>Автоопределение</option>
					{foreach from=$TERMINALS item=item}
						<option value="{$item.NAME}"{if $item.NAME == $terminal} selected{/if}>{$item.NAME} ({$item.TITLE})</option>
					{/foreach}
				</select>
				<small class="form-text text-muted">Терминал на котором будет воспроизводиться музыка.</small>
			</div>
		</div>
		<div class="form-group">
			<label class="col-lg-3 control-label">Скин:</label>
			<div class="col-lg-5">
				<select name="skin" class="form-control">
					{foreach from=$SKINS item=item}
						<option value="{$item.NAME}"{if $item.NAME == $skin} selected{/if}>{$item.NAME}</option>
					{/foreach}
				</select>
				<small class="form-text text-muted">От выбранного скина зависит внешний вид плеера.</small>
			</div>
		</div>
		<div class="form-group">
			<label class="col-lg-3 control-label">Плейлист:</label>
			<div class="col-lg-5">
				<select name="playlist" class="form-control">
					<option value=""{if $playlist == ''} selected{/if}>Не выбрано</option>
					{foreach from=$PLAYLISTS item=item}
						<option value="{$item.ID}"{if $item.ID == $playlist OR $item.TITLE == $playlist} selected{/if}>{$item.TITLE} ({$item.PATH})</option>
					{/foreach}
				</select>
				<small class="form-text text-muted">Музыкальная коллекция для проигрывания.</small>
			</div>
			<div class="col-lg-2">
				<a class="btn btn-default" href="#" onclick="return load_playlist($('select[name=playlist]').val(), $('select[name=terminal]').val(), this);" title="Загрузить выбранный плейлист в плеер"><i class="glyphicon glyphicon-eject"></i> Загрузить в плеер</a>
				<script type="text/javascript">
					function load_playlist(playlist, play_terminal, button) {
						var session_terminal = '{$SESSION.SESSION_TERMINAL}';
						$(button).addClass('disabled');
						$.ajax({
							url: '/popup/app_player.html?ajax=1&command=pl_empty&play_terminal='+encodeURIComponent(play_terminal)+'&session_terminal='+encodeURIComponent(session_terminal),
							dataType: 'json'
						}).done(function(json) {
							if(json.success) {
								if(playlist.length > 0) {
									$.ajax({
										url: '/popup/app_player.html?ajax=1&command=pl_add&param='+encodeURIComponent('http://localhost/popup/app_music.html?ajax=1&command=get_playlist&param='+playlist)+'&play_terminal='+encodeURIComponent(play_terminal)+'&session_terminal='+encodeURIComponent(session_terminal),
										dataType: 'json'
									}).done(function(json) {
										if(json.success) {
											$(button).removeClass('disabled');
										} else {
											$(button).parent('div').attr('title', json.message);
											console.error('pl_add(): '+json.message);
										}
									});
								} else {
									$(button).removeClass('disabled');
								}
							} else {
								$(button).parent('div').attr('title', json.message);
								console.error('pl_empty(): '+json.message);
							}
						});
						return false;
					}
				</script>
			</div>
		</div>
		<div class="form-group">
			<label class="col-lg-3 control-label">&nbsp;</label>
			<div class="col-lg-3">
				<button type="submit" name="submit" value="Submit" class="btn btn-primary"><#LANG_UPDATE#></button>
				<input type="hidden" name="view_mode" value="{$VIEW_MODE}">
				<input type="hidden" name="edit_mode" value="save">
			</div>
		</div>
	</fieldset>
</form>
<hr>
<p>Вызов модуля в меню и сценах:<br>
<strong>&#91;#module name="app_music" mode="menu"#&#93;</strong></p>
Дополнительно можно передать следующие параметры (значения соответствующих настроек будут игнорироваться):<br>
<ul>
<li><b>terminal</b> - терминал для воспроизведения;
<li><b>skin</b> - скин для изменения внешнего вида плеера;
<li><b>playlist</b> - название используемого плейлиста;
</ul>
<p>Например:<br>
<strong>&#91;#module name="app_music" mode="menu" <font color="#8a8a8a">terminal="MAIN" skin="ui-green-audio-player"</font>#&#93;</strong></p>