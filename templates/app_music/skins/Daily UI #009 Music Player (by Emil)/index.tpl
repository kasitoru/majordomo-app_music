<!-- Thanks to Emil: https://codepen.io/emilcarlsson/ -->

<link rel="stylesheet" href="/templates/app_music/skins/{$skin|escape:'url'}/style.css">

<div id="{$container}" class="daily_ui_009_music_player_by_emil">
<div class="cover app_music_cover_image">
	<div class="overlay"></div>
	<div class="content">
		<h2 class="app_music_track_title_text">&nbsp;</h2>
		<h3><span class="app_music_track_time_text">00:00</span> / <span class="app_music_track_length_text">00:00</span></h3>
		<input class="app_music_track_range_input" type="range" value="0" />
		<div class="controls">
			<div class="column repeat app_music_pl_loop_repeat_button" title="Режим повтора: всё, одна дорожка, без повтора"></div>
			<div class="column previous app_music_previous_button" title="Предыдущий трек"></div>
			<div class="column pause app_music_pause_button" title="Воспроизведение / Пауза"></div>
			<div class="column next app_music_next_button" title="Следующий трек"></div>
			<div class="column random app_music_pl_random_button" title="Случайный порядок"></div>
		</div>
	</div>
</div>
</div>

<script type="text/javascript">
	var music_player = new app_music('{$terminal}');
	$(document).ready(function () {
		music_player.init_player();
	});
</script>
