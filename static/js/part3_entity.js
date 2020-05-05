// 按照分类，以列表的形式展示实体
function display_result_in_list(target, exhibits)
{
	var tag = target.split('-')[1];
	var hall = document.getElementById(target);
	var showcase_dic = {};
	var new_items_in_showcase = {};
	var new_confidence = {};
	var cat_color = (tag=='ent')? ent_color_id:attr_color_id;
	var old_confidence = (tag=='ent')? ent_confidence:attr_confidence;
	var ch = (tag=='ent')? ent_ch:attr_ch;
	var en = (tag=='ent')? ent_en:attr_en;
	var items_to_compute = '';
	hall.innerHTML = '';
	// 先构造分类框架，再摆放不同展品
	for (var i = 0; i < en.length; i++)
	{
		// 对标family
		var showcase = create_element('div', 'family');
		var title = create_element('div', 'title', "title-"+tag+'-'+en[i]);
		var lists = create_element('div', 'lists', "lists-"+tag+'-'+en[i]);
		var add_entity = create_element('div', 'add_entity', 'add_entity-'+tag+'-'+en[i]);
		showcase_dic[en[i]] = lists;
		title.setAttribute('onclick', 'click_title(this)');
		title.innerHTML = ch[i];
		add_entity.innerHTML = "+";
		add_entity.setAttribute("onclick", "add_entity(this)")
		showcase.appendChild(title);
		showcase.appendChild(lists);
		lists.appendChild(add_entity);
		hall.append(showcase);
	}
	for (var i = 0; i < exhibits.length; i++)
	{
		if (new_items_in_showcase[exhibits[i][0]])
			continue;
		new_items_in_showcase[exhibits[i][0]] = true;
		if (old_confidence[exhibits[i][0]] != null)
			new_confidence[exhibits[i][0]] = old_confidence[exhibits[i][0]];
		else
		{
			items_to_compute = items_to_compute + exhibits[i][0] + '==';
			new_confidence[exhibits[i][0]] = [exhibits[i][1]];
		}
		
		var exhibit = exhibits[i];
		var entity_shell_div = create_element('div', 'entity-shell-div', '', 'display:inline-block;');
		var style = 'display:inline-block; background-color:' + can_color[cat_color[exhibit[1]]] + ';';
		var entity_div = create_element('div', 'itemDiv', '', style);
		var cat_select = create_element('select', 'cat-select', '', "display:inline-block;");
		var edit_entity = create_element('img', 'edit_entity');
		entity_div.setAttribute("onclick", "click_entity(this)");
		entity_div.innerHTML = exhibit[0];
		cat_select.setAttribute("onchange", "change_category(this)");
		edit_entity.setAttribute("onclick", "edit_entity(this)");
		edit_entity.src = "/static/image/bianji1.svg";
		showcase_dic[exhibit[1]].append(entity_shell_div);
		entity_shell_div.appendChild(entity_div);
		entity_shell_div.appendChild(cat_select);
		entity_shell_div.appendChild(edit_entity);
		for (var j = 0; j < ch.length; j++)
		{
			opt=create_element("option", 'option-'+en[j]);
			opt.setAttribute("value", ch[j]);
			opt.innerHTML = ch[j];
			if (en[j]==exhibit[1])
				opt.setAttribute("selected","selected");
			cat_select.appendChild(opt);
		}
	}
	
	// 找到需要计算置信度的实体，计算其置信度，计算完后，全局变量confidence要清空
	compute_and_display_confidence(tag, new_confidence, items_to_compute);
}

// 计算并展示置信度
function compute_and_display_confidence(tag, new_confidence, items_to_compute)
{
	axios.post('/entityConfidence', Qs.stringify({
		items: items_to_compute
	}))
	.then(function (response) {
		var confidence = response.data["confidence"];
		for (var i = 0; i < confidence.length; i++)
		{
			new_confidence[confidence[i][0]].push(confidence[i][1]);
		}
		display_confidence('confidenceInOrder-'+tag, new_confidence);
		if (tag == 'ent')
			ent_confidence = new_confidence;
		else
			attr_confidence = new_confidence;
	})
	.catch(function (error)
	{
		console.log(error);
	});
}
// 展示置信度
function display_confidence(target, new_confidence)
{
	var tag = target.split('-')[1];
	var keys = Object.keys(new_confidence);
	var items_in_different_cat = {};
	var items_in_order = [];
	var en = (tag == 'ent')? ent_en:attr_en;
	var ch = (tag == 'ent')? ent_ch:attr_ch;
	var color_id_dic = (tag == 'ent')? ent_color_id:attr_color_id;
	for (var i = 0; i < en.length; i++)
	{
		items_in_different_cat[en[i]] = [];
	}
	for (var i = 0; i < keys.length; i++)
	{
		var item = [keys[i], new_confidence[keys[i]][1]];
		items_in_different_cat[new_confidence[keys[i]][0]].push(item);
	}
	var compare = function (list1, list2){
		if (list1[1] > list2[1])
			return -1;
		else if (list1[1] < list2[1])
			return 1;
		else
			return 0;
	}
	for (var i = 0; i < en.length; i++)
	{
		items_in_order.push(items_in_different_cat[en[i]].sort(compare));
	}
	
	var showcase = document.getElementById(target);
	var count = new Array(101);
	showcase.innerHTML = '';
	for (var i = 0; i < 101; i++)
		count[i] = 0;
	for (i = 0; i < items_in_order.length; i++)
	{
		var sub_items = items_in_order[i];
		var confidence_showcase = create_element("div", "confidence-showcase", '');
		if (i % 2 == 0)
			confidence_showcase.setAttribute("style", "background-color:#e9e9e9;")
		else
			confidence_showcase.setAttribute("style", "background-color:#D0D0D0;")
		showcase.appendChild(confidence_showcase);
		for (var j = 0; j < sub_items.length; j++)
		{
			var confidence_shell = create_element("div", "confidence-shell-"+tag+' '+en[i]);
			var confidence_item = create_element("div", "confidence-item", );
			var confidence_score = create_element("div", "confidence-score");
			if (sub_items[j][1] >= 80)
				b_color = can_color[color_id_dic[en[i]]]
			else
				b_color = "#ff3636;"
			confidence_shell.setAttribute("style", "background-color:"+b_color);
			confidence_shell.setAttribute("onclick", 'click_confidence_item(this)');
			confidence_item.innerHTML = sub_items[j][0];
			confidence_score.innerHTML = sub_items[j][1];
			count[sub_items[j][1]]++;
			confidence_showcase.appendChild(confidence_shell);
			confidence_shell.appendChild(confidence_item);
			confidence_shell.appendChild(confidence_score);
		}
		
	}
	draw_score("#"+tag+"-svg", count);
}
// 在置信度界面点击实体
function click_confidence_item(t)
{
	var tag = t.className.split(' ')[0].split('-')[2];
	var cat = t.className.split(' ')[1];
	var selected_exhibits = (tag == 'ent')? ent_selected_exhibits:attr_selected_exhibits;
	var item = t.children[0].innerHTML;
	for(var i = 0; i < selected_exhibits.length; i++)
	{
		if (item == selected_exhibits[i][0])
			return;
	}
	selected_exhibits.push([item, cat]);
	display_selected_exhibits('selected-'+tag, selected_exhibits);
}
// 根据阈值一键选择
function item_shuttle(t)
{
	var tag = t.id.split('-')[1];
	var selected_exhibits = (tag == 'ent')? ent_selected_exhibits:attr_selected_exhibits;
	var thr = document.getElementById("ConThr-"+tag).value;
	if (thr == "")
	{
		return;
	}
	thr = parseFloat(thr)
	if(thr >= 0 && thr <= 100)
	{
		var items = document.getElementsByClassName("confidence-shell-"+tag);
		for (var i = 0; i < items.length; i++)
		{
			var cat = items[i].className.split(' ')[1];
			var item = items[i].children[0].innerHTML;
			var score = parseInt(items[i].children[1].innerHTML);
			var flag = 0;
			for(var j = 0; j < selected_exhibits.length; j++)
			{
				if (item == selected_exhibits[j][0])
				{
					flag = 1;
					break;
				}
			}
			if (flag == 1 || score < thr)
				continue;
			selected_exhibits.push([item, cat]);
		}
		display_selected_exhibits('selected-'+tag, selected_exhibits);
	}
	else
	{
		alert("只接受0~100的数");
		return;
	}
}


// 新增实体，对应漏检错误
function add_entity(t) 
{
	var showcase = t.parentNode;
	var tag = t.id.split('-')[1];
	var cat = t.id.split('-')[2];
	var ch = (tag=='ent')? ent_ch:attr_ch;
	var en = (tag=='ent')? ent_en:attr_en;
	
	var entity_shell_div = create_element('div', 'entity-shell-div', '', 'display:inline-block;');
	var style = 'display:inline-block; background-color:#F0F0F0;';
	var entity_div = create_element('div', 'itemDiv', '', style);
	var cat_select = create_element('select', 'cat-select', '', "display:inline-block;");
	var edit_entity = create_element('img', 'edit_entity');
	entity_div.setAttribute("onclick", "click_entity(this)");
	entity_div.innerHTML = "待输入";
	cat_select.setAttribute("onchange", "change_category(this)");
	edit_entity.setAttribute("onclick", "edit_entity(this)");
	edit_entity.src = "/static/image/bianji1.svg";
	showcase.append(entity_shell_div);
	entity_shell_div.appendChild(entity_div);
	entity_shell_div.appendChild(cat_select);
	entity_shell_div.appendChild(edit_entity);
	for (var j = 0; j < ch.length; j++)
	{
		opt=create_element("option", 'option-'+en[j]);
		opt.setAttribute("value", ch[j]);
		opt.innerHTML = ch[j];
		if (en[j]==cat)
			opt.setAttribute("selected","selected");
		cat_select.appendChild(opt);
	}
}
// 修改实体，对应分词错误
function edit_entity(t)
{
	if(document.getElementById("input-div"))
	{
		temp = document.getElementById("input-div");
		temp.parentNode.removeChild(temp);
	}
	var tag = t.parentNode.parentNode.id.split('-')[1];
	var cat = t.parentNode.parentNode.id.split('-')[2];
	var div = create_element('div', '', 'input-div');
	var input = create_element('input', 'input-'+tag+'-'+cat, 'change_entity');
	var shut = create_element('span', 'parent_delete');
	input.setAttribute("onblur", "finish_edit(this)");
	input.setAttribute("placeholder", t.parentNode.children[0].innerHTML); 
	shut.setAttribute("onclick", "delete_parent(this)");
	shut.innerHTML = "&times";
	t.parentNode.appendChild(div)
	div.appendChild(input);
	div.appendChild(shut);
}
function finish_edit(t)
{
	var tag = t.className.split('-')[1];
	var cat = t.className.split('-')[2];
	var string = document.getElementById("input-cache").innerHTML;
	var new_item = document.getElementById("change_entity").value;
	var result = (tag == 'ent')? entity_result:attribute_result;
	if (string.indexOf(new_item)==-1)
	{
		alert("原文中不存在该实体");
		document.getElementById("change_entity").value = "";
		return;
	}
	if (t.value != "")
	{
		var loc1 = string.indexOf(new_item);
		var loc2 = loc1 + new_item.length-1;
		ctrl_click(cat, loc1, loc2, result)
		display_result_in_text('resultInText-'+tag, result);
		display_result_in_list('resultInLists-'+tag, result);
	}
	shell = t.parentNode.parentNode;
	shell.removeChild(t.parentNode);
}
// 修改实体分类
function change_category(t) {
	var string = $('#input-cache').html();
	var item = t.parentNode.children[0].innerHTML;
	var tag = t.parentNode.parentNode.id.split('-')[1];
	var new_cat = t.options[t.selectedIndex].className.split('-')[1];
	var result = (tag=='ent')? entity_result:attribute_result;
	var loc1 = string.indexOf(item);
	var loc2 = loc1 + item.length - 1;
	ctrl_click(new_cat, loc1, loc2, result)
	display_result_in_text('resultInText-'+tag, result);
	display_result_in_list('resultInLists-'+tag, result);
}


// 选择整个类别
function click_title(t)
{
	var tag = t.id.split('-')[1];
	var cat = t.id.split('-')[2];
	var selected_exhibits = (tag == 'ent')? ent_selected_exhibits:attr_selected_exhibits;
	var items = t.parentNode.children[1].children;
	for (var i = 0; i < selected_exhibits.length; i++)
		if (selected_exhibits[i][1] == cat)
		{
			selected_exhibits.splice(i, 1);
			i = i - 1;
		}
	for (var i = 1; i < items.length; i++)
	{
		if (items[i].children[0].innerHTML != '待输入')
			selected_exhibits.push([items[i].children[0].innerHTML, cat]);
	}
	display_selected_exhibits('selected-'+tag, selected_exhibits);
}
// 选择单个实体
function click_entity(t)
{
	var tag = t.parentNode.parentNode.id.split('-')[1];
	var cat = t.parentNode.parentNode.id.split('-')[2];
	var selected_exhibits = (tag == 'ent')? ent_selected_exhibits:attr_selected_exhibits;
	var item = t.innerHTML;
	if (item == '待输入')
	{
		alert('请输入内容后再选择。');
		return;
	}
	for(var i = 0; i < selected_exhibits.length; i++)
	{
		if (item == selected_exhibits[i][0])
			return;
	}
	selected_exhibits.push([item, cat]);
	display_selected_exhibits('selected-'+tag, selected_exhibits);
}

// 将选择的项目展示出来
function display_selected_exhibits(target, exhibits)
{
	var tag = target.split('-')[1];
	var hall = document.getElementById(target);
	var showcase_dic = {};
	var cat_color = (tag=='ent')? ent_color_id:attr_color_id;
	var ch = (tag=='ent')? ent_ch:attr_ch;
	var en = (tag=='ent')? ent_en:attr_en;
	hall.innerHTML = '';
	// 先构造分类框架，再摆放不同展品
	for (var i = 0; i < en.length; i++)
	{
		// 对标family
		var showcase = create_element('div', 'selected-family-'+tag);
		var title = create_element('div', 'title', "titleSelected-"+tag+'-'+en[i]);
		var lists = create_element('div', 'lists listsSelected', "listsSelected-"+tag+'-'+en[i]);
		var lists_delete = create_element('div', 'parent_delete', 'parent_deleteSelected-'+tag+'-'+en[i]);
		showcase_dic[en[i]] = lists;
		title.setAttribute('onclick', 'delete_title(this)');
		title.innerHTML = ch[i];
		lists_delete.setAttribute("onclick", "delete_lists(this)");
		lists_delete.innerHTML = "&times";
		hall.append(showcase);
		showcase.appendChild(title);
		showcase.appendChild(lists);
		lists.appendChild(lists_delete);
	}
	for (var i = 0; i < exhibits.length; i++)
	{
		var exhibit = exhibits[i];
		var style = 'display:inline-block; background-color:' + can_color[cat_color[exhibit[1]]] + ';';
		var entity_div = create_element('div', 'itemDiv itemDivSelected', '', style);
		entity_div.setAttribute("onclick", "delete_exhibit(this)");
		entity_div.innerHTML = exhibit[0];
		showcase_dic[exhibit[1]].append(entity_div);
	}
}

// 点标题删除整个类别
function delete_title(t)
{
	var tag = t.id.split('-')[1];
	var cat = t.id.split('-')[2];
	var selected_exhibits = (tag == 'ent')? ent_selected_exhibits:attr_selected_exhibits;
	for (var i = 0; i < selected_exhibits.length; i++)
		if (selected_exhibits[i][1] == cat)
		{
			selected_exhibits.splice(i, 1);
			i = i - 1;
		}
	display_selected_exhibits('selected-'+tag, selected_exhibits)
}
// 点叉号删除整个类别
function delete_lists(t)
{
	var tag = t.parentNode.id.split('-')[1];
	var cat = t.parentNode.id.split('-')[2];
	var selected_exhibits = (tag == 'ent')? ent_selected_exhibits:attr_selected_exhibits;
	for (var i = 0; i < selected_exhibits.length; i++)
		if (selected_exhibits[i][1] == cat)
		{
			selected_exhibits.splice(i, 1);
			i = i - 1;
		}
	display_selected_exhibits('selected-'+tag, selected_exhibits)
}
// 删除单个项目
function delete_exhibit(t)
{
	var tag = t.parentNode.id.split('-')[1];
	var item = t.innerHTML;
	var selected_exhibits = (tag == 'ent')? ent_selected_exhibits:attr_selected_exhibits;
	for (var i = 0; i < selected_exhibits.length; i++)
		if (selected_exhibits[i][0] == item)
		{
			selected_exhibits.splice(i, 1);
			break;
		}
	display_selected_exhibits('selected-'+tag, selected_exhibits)
}

// 在实体结果和属性结果中切换
function show_hide(t)
{
	if (t.className[t.className.length-1]=='1')
		return;
	var s = t.id.split('-')[1];
	var h = (s == 'ent')? 'attr':'ent';
	var show = document.getElementsByClassName(s);
	var hide = document.getElementsByClassName(h);
	for (var i = 0; i < show.length; i ++)
	{
		hide[i].style.display="none";
		show[i].style.display="";
	}
	if (document.getElementsByClassName('ent-l-title1').length >= 1)
	{
		var L1 = document.getElementsByClassName('ent-l-title1');
		for (var i =0; i < L1.length; i ++)
		{
			L1[i].className = 'ent-l-title0';
			i = i - 1;
		}
		var R0 = document.getElementsByClassName('ent-r-title0');
		for (var i =0; i < R0.length; i ++)
		{
			R0[i].className = 'ent-r-title1';
			i = i - 1;
		}
		return;
	}
	if (document.getElementsByClassName('ent-l-title0').length >= 1)
	{
		var L0 = document.getElementsByClassName('ent-l-title0');
		for (var i =0; i < L0.length; i ++)
		{
			L0[i].className = 'ent-l-title1';
			i = i - 1;
		}
		var R1 = document.getElementsByClassName('ent-r-title1');
		for (var i =0; i < R1.length; i ++)
		{
			R1[i].className = 'ent-r-title0';
			i = i - 1;
		}
		return;
	}
}



// 处理单个置信度检测
function che_single(id, ent)
{
	axios.post('/check', Qs.stringify({
		entity: ent
	}))
	.then(function (response) {
		console.log(response);
		var data = response.data;
		var score = data["score"];
		var current = document.getElementById(id);
		if (current)
		{
			current.innerHTML = ent;
			current.parentNode.children[1].innerHTML = score;
		}
		else
		{
			var cat = id.split("v")[1][0];
			var shell_ches = document.getElementsByClassName("shell-ches")[cat];
			var shell_che = document.createElement("div");
			var ent_div = document.createElement("div");
			var score_div = document.createElement("div");
			shell_che.setAttribute("class", "shell-che");
			shell_che.setAttribute("onclick", "click_che_ent(this)");
			if (score >= 80)
				b_color = can_color[cat]
			else
				b_color = "#ff3636;"
			shell_che.setAttribute("style", "background-color:"+b_color);
			ent_div.setAttribute("class", "che-ent");
			ent_div.setAttribute("id", id);
			ent_div.setAttribute("readonly", "readonly");
			ent_div.innerHTML = ent;
			score_div.setAttribute("class", "che-score");
			score_div.innerHTML = score;
			shell_ches.appendChild(shell_che);
			shell_che.appendChild(ent_div);
			shell_che.appendChild(score_div);
		}
		
		var count = new Array(101);
		for (var i = 0; i < 101; i++)
			count[i] = 0;
		var lists_ches = document.getElementsByClassName("shell-ches");
		for (i = 0; i < lists_ches.length; i++)
		{
			var ches = lists_ches[i].children;
			for (var j = 0; j < ches.length; j++)
			{
				count[ches[j].children[1].innerHTML]++;
			}
		}
		document.getElementById("check-svg").innerHTML = ""
		draw_score("#check-svg", count);
	})
	.catch(function (error)
	{
		console.log(error);
	});
}
// 处理单个实体消歧
function res_single(id, ent)
{
	axios.post('/resolve', Qs.stringify({
		entity: ent
	}))
	.then(function (response) {
		console.log(response);
		var data = response.data;
		var syns = data["syn"];
		var scores = data["score"];
		var current = document.getElementById(id);
		if (current)
		{
			current.value = ent;
			var shell_syns = current.parentNode;
			if (syns.length == 0)
			{
				current.parentNode.parentNode.removeChild(shell_syns);
				var count = new Array(101);
				var shell_syns = document.getElementsByClassName("shell-syns");
				for (var i = 0; i < 101; i++)
					count[i] = 0;
				for (i = 0; i < shell_syns.length; i++)
				{
					var score = shell_syns[i].children[1].children[1].innerHTML;
					count[score]++;
				}
				document.getElementById("resolve-svg").innerHTML = ""
				draw_score("#resolve-svg", count);
				return;
			}
			for (var i = 1; i < shell_syns.children.length; i++)
				shell_syns.removeChild(shell_syns.children[i]);
			for (i = 0; i < syns.length; i++)
			{
				var shell_syn = document.createElement("div");
				var syn = document.createElement("div");
				var score = document.createElement("div");
				var state = document.createElement("div");
				shell_syn.setAttribute("class", "shell-syn");
				shell_syn.setAttribute("onclick", "alt_syn(this)");
				shell_syns.appendChild(shell_syn);
				syn.setAttribute("class", "syn")
				syn.innerHTML = syns[i];
				score.setAttribute("class", "syn-score");
				score.innerHTML = scores[i];
				state.setAttribute("style", "display:none;");
				state.innerHTML = 0;
				shell_syn.appendChild(syn);
				shell_syn.appendChild(score);
				shell_syn.appendChild(state);
			}
		}
		else
		{
			if (syns.length == 0)
				return;
			var cat = id.split("v")[1][0];
			var shell = document.getElementById("confidenceInOrder-attr");
			var shell_syns = document.createElement('div');
			shell_syns.setAttribute("class", "shell-syns");
			shell.appendChild(shell_syns);
			
			var origin = document.createElement('input');
			origin.setAttribute("class", "origin");
			origin.setAttribute("id", id);
			origin.setAttribute("readonly", "readonly");
			origin.setAttribute("style", "background-color:" + can_color[cat] + "border: 1px solid " + can_color[cat]);
			origin.setAttribute("onclick", "alt_ori(this)");
			origin.value = ent;
			shell_syns.appendChild(origin);
			for (i = 0; i < syns.length; i++)
			{
				var shell_syn = document.createElement("div");
				var syn = document.createElement("div");
				var score = document.createElement("div");
				var state = document.createElement("div");
				shell_syn.setAttribute("class", "shell-syn");
				shell_syn.setAttribute("onclick", "alt_syn(this)");
				shell_syns.appendChild(shell_syn);
				syn.setAttribute("class", "syn")
				syn.innerHTML = syns[i];
				score.setAttribute("class", "syn-score");
				score.innerHTML = scores[i];
				state.setAttribute("style", "display:none;");
				state.innerHTML = 0;
				shell_syn.appendChild(syn);
				shell_syn.appendChild(score);
				shell_syn.appendChild(state);
			}
		}
		
		var count = new Array(101);
		var shell_syns = document.getElementsByClassName("shell-syns");
		for (var i = 0; i < 101; i++)
			count[i] = 0;
		for (i = 0; i < shell_syns.length; i++)
		{
			var score = shell_syns[i].children[1].children[1].innerHTML;
			count[score]++;
		}
		document.getElementById("resolve-svg").innerHTML = ""
		draw_score("#resolve-svg", count);
	})
	.catch(function (error)
	{
		console.log(error);
	});
}
// 点击同义词
function alt_syn(t)
{
	var parent = t.parentNode;
	var origin = parent.children[0];
	var color0 = "#b9b9b9";
	var color1 = origin.style.backgroundColor;
	var len = parent.children.length;
	if (t.children[2].innerHTML == 0)
	{
		for (var i = 1; i < len; i ++)
		{
			if (parent.children[i].children[2].innerHTML == 1)
			{
				parent.children[i].children[2].innerHTML = 0;
				parent.children[i].style.backgroundColor = color0;
			}
		}
		t.children[2].innerHTML = 1;
		t.style.backgroundColor = color1;
	}
	id = origin.id.substr(2);
	if (document.getElementById(id))
	{
		document.getElementById(id).innerHTML = t.children[0].innerHTML;
	}
	if (document.getElementById("c-"+id))
	{
		document.getElementById("c-"+id).innerHTML = t.children[0].innerHTML;
	}
}
// 点击原始词
function alt_ori(t)
{
	var parent = t.parentNode;
	var color0 = "#b9b9b9";
	var len = parent.children.length;
	for (var i = 1; i < len; i ++)
	{
		if (parent.children[i].children[2].innerHTML == 1)
		{
			parent.children[i].children[2].innerHTML = 0;
			parent.children[i].style.backgroundColor = color0;
		}
	}
	id = t.id.substr(2);
	if (document.getElementById(id))
	{
		document.getElementById(id).innerHTML = t.value;
	}
	if (document.getElementById("c-"+id))
	{
		document.getElementById("c-"+id).innerHTML = t.children[0].innerHTML;
	}
}
// 根据阈值一键消歧
function res_shuttle()
{
	var thr = parseFloat(document.getElementById("attrConThr").value);
	if (thr == "")
	{
		alert("数值不能为空");
		return;
	}
	if(thr >= 0 && thr <= 100)
	{
		var list_syns = document.getElementById("confidenceInOrder-attr").children;
		for (var i = 0; i < list_syns.length; i ++)
		{
			var syn = list_syns[i].children[1];
			if (syn.children[1].innerHTML >= thr)
				alt_syn(syn);
		}
	}
	else
	{
		alert("只接受0~100的数");
		return;
	}
}

// 绘制置信度分布
function draw_score(svg_id, data)
{
	var dataset = new Array(10);
	d3.select(svg_id).selectAll("*").remove();
	for (var i=0; i<10; i++)
	{
		var temp = 0;
		for (var j=0; j<10; j++)
			temp = temp + data[i*10+j]
		dataset[i] = temp;
	}
	dataset[9] = dataset[9] + data[100];
	var width = 310;
	var height = 171;
	var padding = {top: 10, right: 0, bottom: 17, left: 20};
	var rectPadding = 4;
	
	var svg = d3.select(svg_id)
				.attr('width', width)
				.attr('height', height);
	
	xx = [0,10,20,30,40,50,60,70,80,90,100];
	peak = d3.max(dataset);
	d = Math.ceil(peak/5);
	yy = [0,d,d*2,d*3,d*4,d*5];
	max = Math.ceil(peak/5)*5;
	const xScale = d3
		.scaleBand()
		.domain(xx)
		.range(dataset)
		.rangeRound([0, width - padding.left - padding.right])

	const yScale = d3
		.scaleLinear()
		.domain([0,max]).nice()
		.rangeRound([height - padding.top - padding.bottom, 0])

	const xAxis = d3.axisBottom(xScale)
	const yAxis = d3.axisLeft(yScale).ticks(5)

	svg
		.selectAll('rect')
		.data(dataset)
		.enter()
		.append('rect')
		.attr("transform", "translate(" + padding.left + "," + padding.top + ")")
		.attr('x', (d, i) => {
			return (xScale.bandwidth() + xScale.paddingInner()) * i + 3
		})
		.attr('y', (d, i) => {
			return yScale(d)
		})
		.attr('height', (d, i) => {
			return height - padding.top - padding.bottom - yScale(d)
		})
		.attr('width', xScale.bandwidth() - rectPadding)
		.attr('fill', '#84d7ff')

	svg
		.selectAll('text')
		.data(dataset)
		.enter()
		.append('text')
		.attr("transform", "translate(" + padding.left + "," + padding.top + ")")
		.attr('x', (d, i) => {
			return (xScale.bandwidth() + xScale.paddingInner()-0.04) * i + 3
		})
		.attr('y', (d, i) => {
			return yScale(d)
		})
		.attr("dx", function() {
			return xScale.bandwidth() / 2 - rectPadding;
		})
		.attr("dy", -1)
		.attr("font-size", 11)
		.text((d) => d)
	
	svg
		.append('g')
		.attr("class", "xAxis")
		.attr("transform", `translate(5,${height - padding.bottom})`)
		.call(xAxis)
	svg
		.append('g')
		.attr("class", "yAxis")
		.attr("transform", `translate(${padding.left},${padding.top})`)
		.call(yAxis)

	svg
		.select('.xAxis')
		.select('path')
		.attr('d', 'M12,0.5H290.5')
	svg
		.select('.xAxis')
		.selectAll("line")
		.attr("y2", "4")
	svg
		.select('.xAxis')
		.selectAll('text')
		.attr('y', 13)
		.attr('dy', 0)
		

	svg
		.select('.yAxis')
		.select('path')
		.attr('d', 'M0.5,147.5V0.5')
	svg
		.select('.yAxis')
		.selectAll("line")
		.attr("x2", "-4")
	svg
		.select('.yAxis')
		.selectAll('text')
		.attr('x', -6)
		
	svg
		.selectAll('rect')
		.on("mouseover",function(d,i){
		  d3.select(this)
			.transition()
			.duration(100)
			.attr("fill","#fff084");
		})
		.on("mouseout",function(d,i){
		  d3.select(this)
			.transition()
			.duration(500)
			.attr("fill","#84d7ff");
		});
}

