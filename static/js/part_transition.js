can_color = {'-1':"#fafafa;", 0:"#ffcfc0;", 1:"#fff5ba;", 2:"#b9e4ff;", 3:"#9cffbf;", 4:"#d09cff;"};

// 初始化前界面
function initial()
{
	ent_confidence={};
	ent_color_id=[];
	ent_selected_exhibits=[];
	attr_confidence={};
	attr_color_id=[];
	attr_selected_exhibits=[];
	
	clear_element('resultInText-ent');
	clear_element('resultInText-attr');
	clear_element('selected-ent');
	clear_element('selected-attr');
	var show = document.getElementsByClassName('ent');
	var hide = document.getElementsByClassName('attr');
	for (var i = 0; i < show.length; i ++)
	{
		hide[i].style.display="none";
		show[i].style.display="";
	}
	clear_element('resultInLists-ent');
	clear_element('resultInLists-attr');
	clear_element('confidenceInOrder-ent');
	d3.select("#ent-svg").selectAll("*").remove();
	clear_element('confidenceInOrder-attr');
	d3.select("#attr-svg").selectAll("*").remove();
	
	clear_element('polish-triple-ent');
	clear_element('polish-triple-attr');
	clear_element('reference-content1');
	clear_element('reference-ent');
	clear_element('reference-attr');
	
	d3.select("#svg").selectAll("*").remove();
}

// 生成web元素
function create_element(tag_name='', class_name='', id_name='', style='')
{
	var new_element = document.createElement(tag_name);
	new_element.setAttribute('class', class_name);
	new_element.setAttribute('id', id_name);
	new_element.setAttribute('style', style)
	return new_element;
}

// 清除元素内的全部内容
function clear_element(tag_name)
{
	document.getElementById(tag_name).innerHTML="";
}

// 删除当前元素的父元素
function delete_parent(t)
{
	var family = t.parentNode.parentNode;
	var lists = t.parentNode;
	family.removeChild(lists);
}


// 将已选内容转化为可以上传到服务器的格式
function get_selected_items(tag, dic)
{
	var families = document.getElementsByClassName("selected-family-"+tag);
	dic["length-"+tag] = families.length;
	for (var i = 0; i < families.length; i ++)
	{
		var family = families[i];
		var cat = family.children[0].id.split('-')[2];
		dic[i+'-'+tag] = cat + "$$";
		for (var j = 1; j < family.children[1].children.length; j ++)
		{
			dic[i+'-'+tag] = dic[i+'-'+tag] + family.children[1].children[j].innerHTML + "===";
		}
	}
}

// 生成三元组和可选实体/关系
function RE_button()
{
	var selected_items = {};
	selected_items["text"] = document.getElementById('input-cache').innerHTML;
	get_selected_items('ent', selected_items);
	get_selected_items('attr', selected_items);
	console.log(selected_items);
	if (selected_items["text"]=='')
	{
		alert('请先抽取实体');
		return;
	}
	
	document.getElementById('polish-triple-ent').innerHTML="Processing ... ";
	document.getElementById('polish-triple-attr').innerHTML="Processing ... ";
	
	axios.post('/triple', Qs.stringify(selected_items))
	.then(function (response) {
		// 全局变量
		triples_ent = response.data["tri-ent"];
		triples_attr = response.data["tri-attr"];
		
		// 可视化三元组
		display_triples('ent',);
		display_triples('attr');
		
		// 原文参考
		var string = selected_items["text"];
		var text_shell = document.getElementById("reference-content1");
		text_shell.innerHTML = "";
		for (var i = 0; i < string.length; i++)
		{
			var temp = create_element('div', '', 'reference-'+i, 'position: relative;');
			temp.innerHTML = string[i];
			text_shell.appendChild(temp);
		}
		
		// 可视化可选实体/属性
		display_selected_items_as_candidates('ent', ent_selected_exhibits);
		display_selected_items_as_candidates('attr', attr_selected_exhibits);
	})
	.catch(function (error)
	{
		console.log(error);
	});
}

var ED_result;
var CR_result;
function ED_CR_button()
{
	set_triples_selected('ent');
	set_triples_selected('attr');
	show_augment_KG();
	show_augment_attribute();
	entity = {};
	axios.post('/EntityDisambiguate', Qs.stringify(entity))
	.then(function (response) {
		ED_result = response.data["ED"];
		display_ED_CR('ED', ED_result);
	})
	.catch(function (error)
	{
		console.log(error);
	});
	
	axios.post('/CoreferenceResolve', Qs.stringify(entity))
	.then(function (response) {
		CR_result = response.data["CR"];
		display_ED_CR('CR', CR_result);
	})
	.catch(function (error)
	{
		console.log(error);
	});
}
// 标记被选择的三元组为选定状态
function set_triples_selected(tag)
{
	var command = document.getElementById("req-tri-"+tag).value;
	var triples = (tag == 'ent')? triples_ent:triples_attr;
	var flag = 0;
	if (command != '')
	{
		var border = parse_instruction(tag, command);
		var index = (tag=='ent')? 0:1;
		var triples_lines = document.getElementsByClassName("triple-content")[index].children;
		
		for (var i = 0; i < triples.length; i++)
		{
			if (triples_lines[i].children[1].value!=''&&triples_lines[i].children[2].value!=''&&triples_lines[i].children[3].value!='')
			{
				if (i>=border[0] && i <= border[1])
				{
					triples[i][4] = 1;
					triples_lines[i].children[7].className = 'selected-triple';
				}
			}
			else
			{
				triples[i][4] = 0;
				triples_lines[i].children[7].className = 'unselected-triple';
				flag = 1;
			}
		}
		if (flag == 1)
			alert('选择完成，三元组中的残缺项不予选择');
	}
}


