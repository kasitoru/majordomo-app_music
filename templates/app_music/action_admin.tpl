<form action="?" method="post" class="form-horizontal">
	{if $OK}<div class="alert alert-success"><strong>Информация:</strong> {$OK}</div>{/if}
	{if $ERROR}<div class="alert alert-danger"><strong>Ошибка:</strong> {$ERROR}</div>{/if}
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
				<div id="load_pl_pb" class="progress" style="display: none; margin: 10px 0 5px 0;">
					<div class="progress-bar progress-bar-striped" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
				</div>
				<small class="form-text text-muted">Музыкальная коллекция для проигрывания.</small>
			</div>
			<div class="col-lg-2">
				<a class="btn btn-default" href="#" onclick="return load_playlist($('select[name=playlist]').val(), $('select[name=terminal]').val(), this);" title="Загрузить выбранный плейлист в плеер"><i class="glyphicon glyphicon-eject"></i> Загрузить в плеер</a>
				<script type="text/javascript">
					function load_playlist(playlist, play_terminal, button) {
						var session_terminal = '{$SESSION.SESSION_TERMINAL}';
						$(button).addClass('disabled');
						$('#load_pl_pb').children('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
						$('#load_pl_pb').show();
						$.ajax({
							url: '/popup/app_player.html?ajax=1&command=pl_empty&play_terminal='+encodeURIComponent(play_terminal)+'&session_terminal='+encodeURIComponent(session_terminal),
							dataType: 'json'
						}).done(function(json) {
							if(json.success) {
								if(playlist.length > 0) {
									$.ajax({
										url: '/popup/app_music.html?ajax=1&command=get_playlist&param='+playlist,
										dataType: 'json'
									}).done(function(json) {
										if(json.success) {
											var items_completed = 0;
											var playlist_length = json.data.length;
											$('#load_pl_pb').children('.progress-bar').attr('aria-valuemax', playlist_length);											
											$.each(json.data, function(index, item) {
												$.ajax({
													url: '/popup/app_player.html?ajax=1&command=pl_add&param='+encodeURIComponent(item)+'&play_terminal='+encodeURIComponent(play_terminal)+'&session_terminal='+encodeURIComponent(session_terminal),
													dataType: 'json'
												}).done(function(json) {
													if(json.success) {
														if((index + 1) == playlist_length) {
															$('#load_pl_pb').hide();
															$(button).removeClass('disabled');
														}
													} else {
														$(button).parent('div').attr('title', json.message);
														console.error('pl_add(): '+json.message);
													}
												}).always(function() {
													items_completed = items_completed + 1;
													var current_value = items_completed / (playlist_length/100);
													$('#load_pl_pb').children('.progress-bar').css('width', current_value + '%').attr('aria-valuenow', current_value);
													$('#load_pl_pb').children('.progress-bar').text(Math.round(current_value) + '%');
												});
											});
										} else {
											$(button).parent('div').attr('title', json.message);
											console.error('get_playlist(): '+json.message);
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