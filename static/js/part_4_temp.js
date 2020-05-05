// 展示三元组
function display_triples(tag)
{
	var color_id = (tag=='ent')? ent_color_id:attr_color_id;
	var triples = (tag=='ent')? triples_ent:triples_attr;
	var triple_title_div = create_element("div", "triple-title-container");
	var triple_title_1 = create_element("div", "triple-title");
	var triple_title_2 = create_element("div", "triple-title");
	var triple_title_3 = create_element("div", "triple-title");
	var add_triple = create_element("img", 'add-triple');
	var shell = create_element('div', 'triple-content');
	var showcase = document.getElementById('polish-triple-'+tag);
	showcase.innerHTML = "";
	showcase.appendChild(triple_title_div);
	showcase.appendChild(shell);
	triple_title_1.innerHTML = (tag=='ent')? "实体1":"实体";
	triple_title_2.innerHTML = (tag=='ent')? "关系":"属性";
	triple_title_3.innerHTML = (tag=='ent')? "实体2":"属性值";
	add_triple.src = "/static/image/增加1.svg";
	add_triple.setAttribute('onclick', 'add_triple(this)');
	add_triple.setAttribute('title', '新增三元组');
	triple_title_div.appendChild(triple_title_1);
	triple_title_div.appendChild(triple_title_2);
	triple_title_div.appendChild(triple_title_3);
	triple_title_div.appendChild(add_triple);
	var compare = function (list1, list2){
		if (list1[3] > list2[3])
			return -1;
		else if (list1[3] < list2[3])
			return 1;
		else
			return 0;
	}
	triples = triples.sort(compare);
	
	exhibit='';
	if (tag == 'ent')
	{
		var cat_select_e = create_element('select', 'cat-select', '', "display:inline-block;");
		var ch = ent_ch;
		var en = ent_en;
		cat_select_e.setAttribute("onchange", "changeEntCategoryInTriple(this)");
		for (var j = 0; j < ch.length; j++)
		{
			opt=create_element("option", 'option-'+en[j]);
			opt.setAttribute("value", ch[j]);
			opt.innerHTML = ch[j];
			if (en[j]==exhibit[1])
				opt.setAttribute("selected","selected");
			cat_select_e.appendChild(opt);
		}
	}
	else
	{
		var cat_select_r = create_element('select', 'cat-select', '', "display:inline-block;");
		var ch = attr_ch;
		var en = attr_en;
		cat_select_r.setAttribute("onchange", "change_category(this)");
		for (var j = 0; j < ch.length; j++)
		{
			opt=create_element("option", 'option-'+en[j]);
			opt.setAttribute("value", ch[j]);
			opt.innerHTML = ch[j];
			if (en[j]==exhibit[1])
				opt.setAttribute("selected","selected");
			cat_select_r.appendChild(opt);
		}
	}
	
	for (var i = 0; i < triples.length; i++)
	{
		var triple = triples[i];
		var triple_line = create_element('div', 'triple-line', 'triple-line-'+tag+'-'+i);
		var num = create_element("div", "triple-num");
		var e1 = create_element("input", "e1", "e1-"+tag+'-'+i);
		var r = create_element("input", "r", "r-"+tag+'-'+i, "background-color: #E0E0E0;");
		var e2 = create_element("input", "e2", "e2-"+tag+'-'+i);
		var c = create_element("div", "c", "c-"+tag+'-'+i);
		var shut = create_element("span", "shut");
		var anchor = create_element("div", '', '', "display: none;");
		var select = create_element("img", "unselected-triple");
		var select_state = create_element("div", '', '', "display: none;");
		var style;
		
		if (triple[0][1]!='new')
		{
			triple_line.setAttribute("onmouseover", "highlight(this)");
			triple_line.setAttribute("onmouseout", "delight(this)");
		}
		shell.appendChild(triple_line);
		
		num.innerHTML = i+1;
		
		color = (triple[0][1]=='new')? '#E0E0E0;':can_color[color_id[triple[0][1]]];
		style = "background-color:" + color;
		e1.setAttribute("type", "text");
		e1.setAttribute("onfocus", "focus_on(this)");
		e1.setAttribute("onblur", "focus_out(this)");
		e1.value = triple[0][0];
		e1.setAttribute("style", style);
		
		r.setAttribute("type", "text");
		r.setAttribute("onfocus", "focus_on(this)");
		r.setAttribute("onblur", "focus_out(this)");
		r.value = triple[2];
		
		color = (triple[1][1]=='new')? '#E0E0E0;':can_color[color_id[triple[1][1]]];
		style = "background-color:" + color;
		e2.setAttribute("type", "text");
		e2.setAttribute("onfocus", "focus_on(this)");
		e2.setAttribute("onblur", "focus_out(this)");
		e2.value = triple[1][0];
		e2.setAttribute("style", style);
		
		c.innerHTML = triple[3];
		
		shut.setAttribute("onclick", "delete_triple(this)");
		shut.innerHTML = "&times";
		
		if (triple[0][1]=='new')
			anchor.innerHTML = '';
		else
			anchor.innerHTML = triple[0][2] + ' ' + triple[1][3];
		
		select.setAttribute("onclick", "select_triple(this)");
		select.title = "选择三元组";
		
		select_state.innerHTML = 0;
		
		triple_line.appendChild(num);
		triple_line.appendChild(e1);
		triple_line.appendChild(r);
		triple_line.appendChild(e2);
		triple_line.appendChild(c);
		triple_line.appendChild(shut);
		triple_line.appendChild(anchor);
		triple_line.appendChild(select);
		triple_line.appendChild(select_state);
	}
}

// 生成分类选择目录
function gen_cat_selection(tag, cat, onchange_function)
{
	var cat_select = create_element('select', 'cat-select', '', "display:inline-block;");
	var ch = (tag=='ent')? ent_ch:attr_ch;
	var en = (tag=='ent')? ent_en:attr_en;
	cat_select.setAttribute("onchange", onchange_function);
	for (var j = 0; j < ch.length; j++)
	{
		opt = create_element("option", 'option-'+en[j]);
		opt.setAttribute("value", ch[j]);
		opt.innerHTML = ch[j];
		if (en[j]==cat)
			opt.setAttribute("selected","selected");
		cat_select.appendChild(opt);
	}
	return cat_select;
}

// 展示可选实体/属性
function display_selected_items_as_candidates(tag, selected_exhibits)
{
	if(selected_exhibits.length == 0)
		return;
	var hall = document.getElementById("reference-"+tag);
	var showcase_dic = {};
	var cat_color = (tag=='ent')? ent_color_id:attr_color_id;
	var ch = (tag=='ent')? ent_ch:attr_ch;
	var en = (tag=='ent')? ent_en:attr_en;
	hall.innerHTML = '';
	// 先构造分类框架，再摆放不同展品
	for (var i = 0; i < en.length; i++)
	{
		var showcase = create_element('div', 'reference-family-'+tag);
		var title = create_element('div', 'title', "titleReference-"+tag+'-'+en[i]);
		var lists = create_element('div', 'lists reference', "listsReference-"+tag+'-'+en[i]);
		showcase_dic[en[i]] = lists;
		title.setAttribute('onclick', 'delete_title(this)');
		title.innerHTML = ch[i];
		hall.append(showcase);
		showcase.appendChild(title);
		showcase.appendChild(lists);
	}
	for (var i = 0; i < selected_exhibits.length; i++)
	{
		var exhibit = selected_exhibits[i];
		var style = 'display:inline-block; background-color:' + can_color[cat_color[exhibit[1]]] + ';';
		var entity_div = create_element('div', 'itemDivReference', '', style);
		entity_div.innerHTML = exhibit[0];
		showcase_dic[exhibit[1]].append(entity_div);
	}
}

var punctuation = '。！？.!?'
// 鼠标悬浮高亮三元组出处
function highlight(t) 
{
	var range = t.children[6].innerHTML.split(" ");
	var begin = (range[0] < range[1])? range[0]:range[1];
	var end = (range[0] > range[1])? range[0]:range[1];
	var end_max = $("#reference-content1").children().length;
	begin = parseInt(begin);
	end = parseInt(end);
	for (var i = 0; i < 50; i ++)
	{
		if (punctuation.indexOf($("#reference-" + begin).html())!=-1 || begin == 0)
		{
			if (punctuation.indexOf($("#reference-" + begin).html())!=-1)
				begin = begin + 1;
			break;
		}
		begin = begin - 1;
	}
	for (var i = 0; i < 50; i ++)
	{
		if (punctuation.indexOf($("#reference-" + (end-1)).html())!=-1 || end == end_max)
			break;
		end = end + 1;
	}
	for (i = begin; i < end; i ++)
	{
		temp = document.getElementById("reference-" + i);
		temp.setAttribute("class", "highlight");
	}
}
// 鼠标移开关闭高亮
function delight(t) 
{
	var range = t.children[6].innerHTML.split(" ");
	var begin = (range[0] < range[1])? range[0]:range[1];
	var end = (range[0] > range[1])? range[0]:range[1];
	var end_max = $("#reference-content1").children().length;
	begin = parseInt(begin);
	end = parseInt(end);
	for (var i = 0; i < 50; i ++)
	{
		if(punctuation.indexOf($("#reference-" + begin).html())!=-1 || begin == 0)
			break;
		begin = begin - 1;
	}
	for (var i = 0; i < 50; i ++)
	{
		if(punctuation.indexOf($("#reference-" + (end-1)).html())!=-1 || end == end_max)
			break;
		end = end + 1;
	}
	for (i = begin; i < end; i ++)
	{
		temp = document.getElementById("reference-" + i);
		temp.setAttribute("class", "");
	}
}
// 滚动到三元组出处
function scrollToText(t) 
{
	var anchor = t.parentNode.children[6].innerHTML;
	anchor = anchor.split(" ")[0];
	console.log(anchor);
	tag = '#reference-'+anchor;
	console.log(tag);
	var topOffset = $(tag).position().top;
	var relative = $('#reference-content1').scrollTop()
	abs = topOffset + relative - 60;
	console.log(abs);
	$('#reference-content1').scrollTop(abs);
}
// 删除三元组
function delete_triple(t)
{
	var num = parseInt(t.parentNode.id.split('-')[3]);
	var tag = t.parentNode.id.split('-')[2];
	var triples = (tag == 'ent')? triples_ent:triples_attr;
	triples.splice(num, 1);
	display_triples(tag);
}
// 准备修改三元组
function focus_on(t)
{
	// document.getElementById("cache").innerHTML = t.value;
	scrollToText(t);
}
// 三元组修改完成
function focus_out(t)
{
	var tag = t.parentNode.id.split('-')[2];
	var num = parseInt(t.parentNode.id.split('-')[3]);
	var triples = (tag == 'ent')? triples_ent:triples_ent;
	var items_can = (tag == 'ent')? ent_selected_exhibits:attr_selected_exhibits;
	var cache = document.getElementById("cache").innerHTML;
	
	if(t.className=="r")
	{
		triples[num][2] = t.value;
		return;
	}
	else
	{
		for (var i = 0; i < items_can.length; i++)
		{
			if(items_can[i][0]==t.value||(t.value==""&&cache==""))
			{
				triples[num][parseInt(t.className[1])-1][0] = t.value;
				return;
			}
		}
		alert("请检查实体是否可选");
		t.value = cache;
		return;
	}
}
// 点击新增三元组
function add_triple(t) 
{
	var tag = t.parentNode.parentNode.id.split('-')[2];
	var triples = (tag=='ent')? triples_ent:triples_attr;
	var triple = [['', 'new'], ['', 'new'], '', 0];
	triples.splice(triples.length, 0, triple);
	display_triples(tag);
}
var selected_triple_ent;
var selecten_triple_attr;
// 点击选择三元组
function select_triple(t)
{
	if (t.parentNode.children[8].innerHTML == '0')
	{
		t.parentNode.children[8].innerHTML = 1;
		t.className = 'selected-triple';
	}
	else
	{
		t.parentNode.children[8].innerHTML = 0;
		t.className = 'unselected-triple';
	}
}


// 写入实体词典
function write_into_entity_dic(t)
{
	t.setAttribute("src", "/static/image/mark2.svg");
}
// 写入关系词典
function write_into_attribute_dic(t)
{
	t.setAttribute("src", "/static/image/mark2.svg");
}


// 提示
function tips()
{
	if (document.getElementById("tips-text"))
	{
		document.getElementById("tips-text").parentNode.removeChild(document.getElementById("tips-text"));
		return;
	}
	var parent = document.getElementById("polish-triple");
	var tips = document.createElement("div");
	tips.setAttribute("id", "tips-text");
	parent.appendChild(tips);
	var title = document.createElement("div");
	var tips_delete = document.createElement("span");
	var content = document.createElement("div");
	title.setAttribute("id", "tips-title");
	title.innerHTML = "选择语句说明";
	var p = [
		"此处提供四种选择三元组的语句",
		"1.all——选择所有三元组",
		"2.[1:10]——选择序号为1到10的三元组",
		"3.[>80]——选择置信度大于80的三元组",
		"4.[>=80]——选择置信度大于等于80的三元组",
		"最后一列数据是三元组成立的置信度。输入选择语句后，点击右端按钮可视化"
		];
	for (var i =0; i < p.length; i++)
	{
		var temp = document.createElement("p");
		temp.innerHTML = p[i];
		content.appendChild(temp);
	}
	content.setAttribute("id", "tips-content");
	tips_delete.setAttribute("class", "parent_delete");
	tips_delete.setAttribute("onclick", "delete_parent(this)");
	tips_delete.innerHTML = "&times";
	tips.appendChild(title);
	tips.appendChild(tips_delete);
	tips.appendChild(content);
}

// 新增关系
function add_relation()
{
	var shell = document.getElementById("reference-content3");
	var r_shell = document.createElement("div");
	var r_new = document.createElement("input");
	var r_delete = document.createElement("img");
	r_shell.setAttribute("class", "shell-relation");
	shell.appendChild(r_shell);
	r_new.setAttribute("class", "new-r-relation");
	r_delete.setAttribute("id", "relation-delete");
	r_delete.setAttribute("onclick", "delete_parent(this)");
	r_delete.src = "/static/image/删除1.svg";
	r_shell.appendChild(r_new);
	r_shell.appendChild(r_delete);
}



