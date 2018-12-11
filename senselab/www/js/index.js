/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var socket;

$('#TriggerTypeSelector').change(function ()
{
	var selector = '#trigger-' + $(this).val();

	$('.myCollapseTriggers').collapse('hide');

	$(selector).collapse('show');
});

$('#ActionTypeSelector').change(function ()
{
	var selector = '#action-' + $(this).val();

	$('.myCollapseActions').collapse('hide');

	$(selector).collapse('show');
});

$('#SliderFrom').on('input', function ()
{
	$('#SliderTo').html($('#SliderFrom').val() + '%')
});

function mySubmit (strAction)
{
	var unindexed_array = $('#NewRuleForm').serializeArray();
	var values = {};

	$.map(unindexed_array, function (n, i)
	{
		values[n['name']] = n['value'];
	});
	console.log(values);
	ruleData = {
		'rule_name': undefined,
		'trigger_type_id': undefined,
		'trigger_data_int': undefined,
		'trigger_data_time': undefined,
		'action_type_id': undefined,
		'action_data_text': undefined
	};

	ruleData.rule_name = values['rule_name'];
	ruleData.trigger_type_id = values['trigger_type'];
	switch (ruleData.trigger_type_id)
	{
		case '3':
		case '4':
			ruleData.trigger_data_int = values['trigger_data_temp'];
			break;
		case '7':
		case '8':
			ruleData.trigger_data_int = values['trigger_data_light'];
			break;
		case '11':
		case '12':
			ruleData.trigger_data_int = values['trigger_data_strength'];
			break;
		case '13':
		case '14':
			ruleData.trigger_data_int = values['trigger_data_humidity'];
			break;
		default:
			ruleData.trigger_data_int = undefined;
			break;
	}
	switch (ruleData.trigger_type_id)
	{
		case '9':
		case '10':
			ruleData.trigger_data_time = values['trigger_data_time'];
			break;

		default:
			break;
	}
	if (strAction == '234')
	{
		ruleData.action_type_id = values['action_type'];
	} else
	{
		ruleData.action_type_id = strAction;
	}
	switch (ruleData.action_type_id)
	{
		case '1':
			ruleData.action_data_text = values['action_data_text'];
			break;
		default:
			ruleData.action_data_text = undefined;
			break;
	}

	console.log(ruleData);

	socket.emit('new_rule', JSON.stringify(ruleData));

	return false;
}

function getRuleList ()
{
	socket.emit('get_rule_list');
	return false;
}

function createCard (cardData)
{
	var trigger_desc_full;
	switch (cardData.trigger_type_id)
	{
		case 3:
		case 4:
			trigger_desc_full = cardData.trigger_description_long + ' ' + cardData.trigger_data_int + '°C';
			break;
		case 7:
		case 8:
			trigger_desc_full = cardData.trigger_description_long + ' ' + cardData.trigger_data_int + '%';
			break;
		case 9:
		case 10:
			trigger_desc_full = cardData.trigger_description_long + ' ' + cardData.trigger_data_time;
			break;
		default:
			trigger_desc_full = cardData.trigger_description_long;
			break;
	}
	var action_desc_full;
	switch (cardData.action_type_id)
	{
		case 1:
		case 4:
			action_desc_full = cardData.action_description_long + ' ' + cardData.action_data_text;
			break;
		default:
			action_desc_full = cardData.action_description_long;
			break;
	}
	var cardTemplate = [
		'<div class="card mb-3">',
		'<div class="card-body">',
		'<h3 class="card-title">',
		cardData.rule_name,
		'</h3>',
		'<p class="card-title">',
		trigger_desc_full,
		'</p>',
		'<p class="card-title">',
		action_desc_full,
		'</p>',
		'</div>',
		'</div>'
	];
	return $(cardTemplate.join(''));
}


$(document).ready(function ()
{
	socket = io.connect('http://localhost:8080');

	socket.on('rule_list', function (data)
	{
		var rule_list_parsed = JSON.parse(data);

		console.log(rule_list_parsed);

		var cards = $();
		$.each(rule_list_parsed, function (index, value)
		{
			console.log(index + ' - ' + value.rule_name);
			cards = cards.add(createCard(value))
		});
		$('#CardArea').empty();
		$('#CardArea').append(cards);
	});
});