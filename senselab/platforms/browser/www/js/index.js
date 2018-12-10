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

$('#TriggerTypeSelector').change(function ()
{
	var selector = '#trigger-' + $(this).val();

	$('.myCollapse').collapse('hide');

	$(selector).collapse('show');
});

$('#SliderFrom').on('input', function ()
{
	$('#SliderTo').html($('#SliderFrom').val() + '%')
});

$(document).ready(function ()
{
	var socket = io.connect('http://localhost:8080');
	$('#NewRuleForm').submit(function ()
	{
		var unindexed_array = $('#NewRuleForm').serializeArray();
		var values = {};
		$.map(unindexed_array, function (n, i)
		{
			values[n['name']] = n['value'];
		});
		ruleData = {
			'trigger_type_id': undefined,
			'trigger_data_int': undefined,
			'trigger_data_datetime': undefined,
			'action_type_id': undefined,
			'action_data_text': undefined
		};
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
		ruleData.trigger_data_datetime = values['trigger_data_datetime'];
		ruleData.action_type_id = values['action_type_id'];
		ruleData.action_data_text = values['action_data_text'];

		console.log(ruleData);

		socket.emit('new_rule', JSON.stringify(ruleData));

		return false;
	});
});

