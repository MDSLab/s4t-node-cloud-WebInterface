/**
 * Copyright 2017-2018 Carmelo Romeo (caromeo@unime.it)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

$('[data-reveal-id="modal-show-projects"]').on('click',
	function() {
		$('#projects_show-output').empty();

		var fields_to_show = ["name", "description", "uuid"];

		$.ajax({
			url: s4t_api_url+"/projects",
			type: "GET",
			dataType: 'json',
			headers: ajax_headers,

			success: function(response){
				parsed_response = parse_json_fields(fields_to_show, response.message, false);
				create_table_from_json("show_projects_table", parsed_response, fields_to_show);


				//parsed_response = parse_json_fields(fields_to_show, response.message, string_or_json);
				//document.getElementById("projects_show-output").innerHTML = parsed_response;
			},
			error: function(response){
				verify_token_expired(response.responseJSON.message, response.responseJSON.result);
				//document.getElementById("projects_show-output").innerHTML = JSON.stringify(response.responseJSON.message);
			}
		});
	}
);


function clean_project_fields(form_name, flag_output){
	document.getElementById(form_name+"_projectname").value = '';
	document.getElementById(form_name+"_description").value = '';

	if(flag_output)
		document.getElementById(form_name+"-output").innerHTML ='';
}


$('[data-reveal-id="modal-create-project"]').on('click',
	function() {
		clean_project_fields("project_create", true);
	}
);


$('[data-reveal-id="modal-update-project"]').on('click',
	function(){
		clean_project_fields("project_update", true);
		update_projects("update_projectlist", "project_update-output");
	}
);


$('[data-reveal-id="modal-delete-project"]').on('click',
	function() {
		update_projects("unregister_projectlist", "project_delete-output");
	}
);


$('[id="update_projectlist"]').on('change',
	function() {

		var project_id = $( "#update_projectlist option:selected" ).val();

		if(project_id == "--"){
			clean_project_fields("project_update");
		}
		else{
			$.ajax({
				url: s4t_api_url+"/projects/"+project_id,
				type: 'GET',
				dataType: 'json',
				headers: ajax_headers,
				success: function(response){
					document.getElementById("project_update_projectname").value = response.message.name;
					document.getElementById("project_update_description").value = response.message.description;
				},
				error: function(response){
					verify_token_expired(response.responseJSON.message, response.responseJSON.result);
					//alert('ERROR: '+JSON.stringify(response));
				}
			});
		}
		document.getElementById("project_update-output").innerHTML ='';
	}
);


function update_projects(select_id, output_id, callback){
	$.ajax({
		url: s4t_api_url+"/projects",
		type: "GET",
		dataType: 'json',
		headers: ajax_headers,

		success: function(response){
			$('#'+select_id).empty();
			if(output_id && output_id !="")	$('#'+output_id).empty();

			$('#'+select_id).append('<option title="--" value="--" data-unit="">--</option>');

			projects_list = response.message.sort(SortByName);

			for(i=0;i<projects_list.length;i++){
				$('#'+select_id).append('<option title="'+projects_list[i].name+'" value="'+projects_list[i].uuid+'" data-unit="">'+projects_list[i].name+'</option>');
			}

			if(callback) callback("OK");
		},
		error: function(response){
			verify_token_expired(response.responseJSON.message, response.responseJSON.result);
			//document.getElementById("#"+output_id).innerHTML = '<pre>'+JSON.stringify(response.message,null,"\t")+'</pre>';
			if(callback) callback("OK");
		}
	});
}



$('#create-project').click(function(){

	data = {};

	var name = document.getElementById("project_create_projectname").value;

	if(name == "") { alert("Insert a name!"); document.getElementById('loading_bar').style.visibility='hidden';}
	else{
		data.name = name;
		data.description = document.getElementById("project_create_description").value;

		$.ajax({
			url: s4t_api_url+"/projects",
			type: 'POST',
			dataType: 'json',
			headers: ajax_headers,
			data: JSON.stringify(data),

			success: function(response){
				document.getElementById('loading_bar').style.visibility='hidden';
				//document.getElementById("project_create-output").innerHTML = '<pre>'+JSON.stringify(response.message) +'</pre>';
				document.getElementById("project_create-output").innerHTML = JSON.stringify(response.message);
				//update_projects("unregister_projectlist", "project_delete-output");
				refresh_lists();
			},
			error: function(response){
				document.getElementById('loading_bar').style.visibility='hidden';
				verify_token_expired(response.responseJSON.message, response.responseJSON.result);
				document.getElementById("project_create-output").innerHTML = JSON.stringify(response.responseJSON.message);
			}
		});
	}
});



$('#update-project').click(function(){

	data = {};

	var name = document.getElementById("project_update_projectname").value;
	var project_id = document.getElementById("update_projectlist").value;

	if(project_id == "--"){alert('Select a Project');document.getElementById('loading_bar').style.visibility='hidden';}
	else if(name == "") {alert('Insert a name');document.getElementById('loading_bar').style.visibility='hidden';}
	else{
		data.name = name;
		data.description = document.getElementById("project_update_description").value;

		document.getElementById("project_update-output").innerHTML ='';

		$.ajax({
			url: s4t_api_url+"/projects/"+project_id,
			type: 'PATCH',
			dataType: 'json',
			headers: ajax_headers,
			data: JSON.stringify(data),

			success: function(response){
				document.getElementById('loading_bar').style.visibility='hidden';
				document.getElementById("project_update-output").innerHTML = JSON.stringify(response.message);
				update_projects("update_projectlist");
				clean_project_fields("project_update");
				refresh_lists();
			},
			error: function(response){
				document.getElementById('loading_bar').style.visibility='hidden';
				verify_token_expired(response.responseJSON.message, response.responseJSON.result);
				document.getElementById("project_update-output").innerHTML = JSON.stringify(response.responseJSON.message);
			}
		});
	}
});



$("#unregister-project").click(function(){

	var project_id = document.getElementById("unregister_projectlist").value;

	if (project_id == "--") {
		alert('Select at least a Project');
		document.getElementById('loading_bar').style.visibility='hidden';
		document.getElementById("project_delete-output").innerHTML = "";
	}
	else{
		$.ajax({
			url: s4t_api_url+"/projects/"+project_id,
			type: 'DELETE',
			dataType: 'json',
			headers: ajax_headers,

			success: function(response){
				update_projects("unregister_projectlist");
				document.getElementById('loading_bar').style.visibility='hidden';
				document.getElementById("project_delete-output").innerHTML = JSON.stringify(response.message);
				refresh_lists();
			},
			error: function(response){
				document.getElementById('loading_bar').style.visibility='hidden';
				verify_token_expired(response.responseJSON.message, response.responseJSON.result);
				document.getElementById("project_delete-output").innerHTML = JSON.stringify(response.responseJSON.message);
			}
		});
	}
});