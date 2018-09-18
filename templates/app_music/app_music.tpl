{if $ACTION == 'admin'}
	<!-- Control Panel -->
	{include file="./action_admin.tpl"}
{else}
	<!-- Frontend -->
	{include file="./action_usual.tpl"}
{/if}
