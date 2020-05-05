

// 获取文本
function click_catch_text_button()
{
	if (document.getElementById('input-url').value=="")
		alert("网址不能为空");
	axios.post('/catch', Qs.stringify({
		url: document.getElementById('input-url').value
	}))
	.then(function (response) {
		console.log(response);
		document.getElementById("input-text").value = response.data["text"];
	})
	.catch(function (error)
	{
		console.log(error);
	});
}

// 清空当前界面
function clean()
{
	document.getElementById('divide-word').innerHTML="";
	document.getElementById('choose-entity').innerHTML="";
	document.getElementById('attention-entity').innerHTML="";
	document.getElementById('polish-triple-sub').innerHTML="";
}

// 上传文本，显示分词结果和实体
var category;
function click_upload_text_button()
{
	if (document.getElementById('input-text').value == "")
		alert("输入文本不能为空");
	document.getElementById('divide-word').innerHTML="Processing ... ";
	axios.post('/split', Qs.stringify({
		text: document.getElementById('input-text').value
	}))
	.then(function (response) {
		clean();
		var parent = document.getElementById('divide-word')
		var words = response.data["words"];
		var color = response.data["belong"];
		category = response.data["category"];
		var entity = response.data["entity"];
		var entity_color = response.data["entity_color"];
		var entity_shell = response.data["entity_shell"];
		// 显示当前的分词结果
		for (var i = 0; i < words.length; i++)
		{
			var word_div = document.createElement("div");
			var word_div = document.createElement("div");
			word_div.setAttribute("class", "word-div");
			word_div.setAttribute("id", "word-div"+i);
			word_div.setAttribute("onkeydown", "inputWidth(event)");
			word_div.setAttribute("onkeyup", "inputWidth(event)");
			word_div.setAttribute("oninput", "inputWidth(event)");
			word_div.innerHTML = words[i];
			if (color[i]<=2)
				b_color="background-color:#FFC78E;";
			else if (color[i]<=5)
				b_color="background-color:#93FF93;";
			else
				b_color="background-color:#F0F0F0;"
			word_div.setAttribute("style", b_color);
			parent.appendChild(word_div);
		}
		
		// 显示当前的实体及分类
		parent = document.getElementById("attention-entity");
		for (var i = 0; i < category.length; i++)
		{
			var family = document.createElement("div");
			var title = document.createElement("div");
			var lists = document.createElement("div");
			family.setAttribute("class", "family");
			family.setAttribute("id", "family"+i);
			parent.appendChild(family);
			
			title.setAttribute("class", "title");
			title.setAttribute("id", "title"+i);
			title.setAttribute("onclick", "click_title(this)");
			title.innerHTML = category[i];
			lists.setAttribute("class", "lists");
			lists.setAttribute("id", "lists"+i);
			
			family.appendChild(title);
			family.appendChild(lists);
			
			var add_entity = document.createElement("span");
			add_entity.innerHTML = "+";
			add_entity.setAttribute("class", "add_entity");
			add_entity.setAttribute("onclick", "add_entity(this)")
			lists.appendChild(add_entity);
			
			var sub_entity = entity[i];
			var sub_entity_color = entity_color[i];
			for (var j=0; j<sub_entity.length; j++)
			{
				var entity_shell_div = document.createElement("div");
				entity_shell_div.setAttribute("class", "entity_shell_div");
				entity_shell_div.setAttribute("id", "entity_shell_div"+i+"-"+j);
				entity_shell_div.setAttribute("style", "display:inline-block;");
				lists.appendChild(entity_shell_div)
				
				var entity_div = document.createElement("div");
				var tag_select = document.createElement("select");
				var edit_entity = document.createElement("div");
				entity_div.setAttribute("class", "entity_div");
				entity_div.setAttribute("id", "entity_div"+i+"-"+j);
				if (sub_entity_color[j]==1)
					b_color="background-color:#FFC78E;";
				else
					b_color="background-color:#93FF93;";
				entity_div.setAttribute("style", b_color+"display:inline-block;");
				entity_div.setAttribute("onclick", "click_entity(this)");
				entity_div.innerHTML = sub_entity[j];
				tag_select.setAttribute("class","tag_select");
				tag_select.setAttribute("style", "display:inline-block;");
				tag_select.setAttribute("onchange", "change_category(this)");
				edit_entity.setAttribute("class", "edit_entity");
				edit_entity.setAttribute("onclick", "edit_entity(this)");
				edit_entity.innerHTML = "✏";
				entity_shell_div.appendChild(entity_div);
				entity_shell_div.appendChild(tag_select);
				entity_shell_div.appendChild(edit_entity);
				for (var k = 0; k < category.length; k++)
				{
					opt=document.createElement("option");
					opt.setAttribute("value", category[k]);
					opt.innerHTML = category[k];
					if (k==i)
						opt.setAttribute("selected","selected");
					tag_select.appendChild(opt);
				}
			}
		}
		
		var reference_text = document.getElementById("polish-reference-text");
		var title1 = document.createElement("div");
		var orig_text = document.createElement("div");
		
		reference_text.innerHTML = "";
		title1.setAttribute("id", "reference-title1");
		title1.innerHTML = "原文参考";
		orig_text.setAttribute("id", "orig-text");
		orig_text.innerHTML = document.getElementById('input-text').value;
		reference_text.appendChild(title1);
		reference_text.appendChild(orig_text);
	})
	.catch(function (error)
	{
		console.log(error);
	});
}
// 新增实体，对应漏检错误
function add_entity(t) 
{
	var lists = t.parentNode;
	var i = parseInt(lists.id.split("lists")[1]);
	var j = lists.children.length-1;
	var entity_shell_div = document.createElement("div");
	entity_shell_div.setAttribute("class", "entity_shell_div");
	entity_shell_div.setAttribute("id", "entity_shell_div"+i+"-"+j);
	entity_shell_div.setAttribute("style", "display:inline-block;");
	lists.appendChild(entity_shell_div)
	
	var entity_div = document.createElement("div");
	var tag_select = document.createElement("select");
	var edit_entity = document.createElement("span");
	entity_div.setAttribute("class", "entity_div");
	entity_div.setAttribute("id", "entity_div"+i+"-"+j);
	entity_div.setAttribute("style", "background-color:#F0F0F0; display:inline-block;");
	entity_div.setAttribute("onclick", "click_entity(this)");
	entity_div.innerHTML="待输入";
	tag_select.setAttribute("class","tag_select");
	tag_select.setAttribute("style", "display:inline-block;");
	tag_select.setAttribute("onchange", "change_category(this)");
	edit_entity.setAttribute("class", "edit_entity");
	edit_entity.setAttribute("onclick", "edit_entity(this)");
	edit_entity.innerHTML = "✏";
	entity_shell_div.appendChild(entity_div);
	entity_shell_div.appendChild(tag_select);
	entity_shell_div.appendChild(edit_entity);
	for (var k = 0; k < category.length; k++)
	{
		opt=document.createElement("option");
		opt.setAttribute("value", category[k]);
		opt.innerHTML = category[k];
		if (k==i)
			opt.setAttribute("selected","selected");
		tag_select.appendChild(opt);
	}
}
// 修改实体，对应分词错误
function edit_entity(t)
{
	if(document.getElementById("change_entity"))
	{
		temp = document.getElementById("change_entity");
		temp.parentNode.removeChild(temp);
	}
	var input = document.createElement("input");
	input.setAttribute("id", "change_entity");
	input.setAttribute("onblur", "finish_edit(this)");
	input.setAttribute("placeholder", t.parentNode.children[0].innerHTML); 
	t.parentNode.appendChild(input)
}
function finish_edit(t)
{
	var string = document.getElementById("polish-reference-text").innerHTML;
	var alter = document.getElementById("change_entity").value;
	if (string.indexOf(alter)==-1)
	{
		alert("原文中不存在该实体");
		document.getElementById("change_entity").value = "";
		return;
	}
	if (t.value != "")
		t.parentNode.children[0].innerHTML = t.value;
	if (document.getElementById("c-"+t.parentNode.id))
	{
		c_shell = document.getElementById("c-"+t.parentNode.id);
		c_shell.children[0].innerHTML = t.value;
	}
	shell = t.parentNode;
	shell.removeChild(t);
}

// 选择整个类别
function click_title(t)
{
	var parent = document.getElementById("choose-entity");
	var i = 0;
	while(parent.children[i])
	{
		if(parent.children[i].id==("c-"+t.parentNode.id))
			return;
		i = i+1;
	}
	var family = t.parentNode.cloneNode(true);
	family.setAttribute("class", "c-family");
	family.setAttribute("id", "c-"+family.id);
	title = family.children[0];
	title.setAttribute("class", "c-title");
	title.setAttribute("id", "c-"+title.id);
	title.setAttribute("onclick", "delete_title(this)");
	lists = family.children[1];
	lists.setAttribute("class", "c-lists");
	lists.setAttribute("id", "c-"+lists.id);
	lists.removeChild(lists.children[0]);
	var i = 0;
	while(lists.children[i])
	{
		child = lists.children[i];
		child.setAttribute("class", "c-entity_shell_div");
		child.setAttribute("id", "c-"+child.id);
		child.setAttribute("onclick", "delete_entity(this)");
		child.children[0].setAttribute("class", "c-entity_div");
		child.children[0].setAttribute("id", "c-"+child.children[0].id);
		child.children[0].setAttribute("onclick", "");
		child.children[1].setAttribute("style", "display:none;");
		child.children[2].setAttribute("style", "display:none;");
		if (child.children[3])
			child.removeChild(child.children[3]);
		i = i+1;
	}
	parent.appendChild(family);
	var lists_parent = document.getElementById(lists.id);
	var lists_delete = document.createElement("span");
	lists_delete.setAttribute("class", "c-lists_delete");
	lists_delete.setAttribute("onclick", "delete_lists(this)");
	lists_delete.innerHTML = "&times";
	lists_parent.appendChild(lists_delete);
}
// 选择单个实体
function click_entity(t)
{
	var parent = document.getElementById("choose-entity");
	var family = t.parentNode.parentNode.parentNode.cloneNode(true);
	var flag_family = false;
	if (document.getElementById("c-"+family.id))
		flag_family = true;
	if (flag_family==false)
	{
		family.setAttribute("class", "c-family");
		family.setAttribute("id", "c-"+family.id);
		title = family.children[0];
		title.setAttribute("class", "c-title");
		title.setAttribute("id", "c-"+title.id);
		title.setAttribute("onclick", "delete_title(this)");
		lists = family.children[1];
		lists.setAttribute("class", "c-lists");
		lists.setAttribute("id", "c-"+lists.id);
		lists.innerHTML = "";
		parent.appendChild(family);
		var entity_shell = t.parentNode.cloneNode(true)
		var lists_delete = document.createElement("span");
		lists_delete.setAttribute("class", "c-lists_delete");
		lists_delete.setAttribute("onclick", "delete_lists(this)");
		lists_delete.innerHTML = "&times";
		entity_shell.setAttribute("class", "c-entity_shell_div");
		entity_shell.setAttribute("id", "c-"+entity_shell.id);
		entity_shell.setAttribute("onclick", "delete_entity(this)");
		entity_shell.children[0].setAttribute("class", "c-entity_div");
		entity_shell.children[0].setAttribute("id", "c-"+entity_shell.children[0].id);
		entity_shell.children[0].setAttribute("onclick", "");
		entity_shell.children[1].setAttribute("style", "display:none;");
		entity_shell.children[2].setAttribute("style", "display:none;");
		if (entity_shell.children[3])
			entity_shell.removeChild(entity_shell.children[3]);
		lists.appendChild(entity_shell);
		lists.appendChild(lists_delete);
	}
	else
	{
		var c_family = document.getElementById("c-"+family.id);
		if (c_family.children[1])
		{
			c_lists = document.getElementById("c-"+family.id).children[1];
			if (document.getElementById("c-"+t.id))
				return;
			var entity_shell = t.parentNode.cloneNode(true)
			entity_shell.setAttribute("class", "c-entity_shell_div");
			entity_shell.setAttribute("id", "c-"+entity_shell.id);
			entity_shell.setAttribute("onclick", "delete_entity(this)");
			entity_shell.children[0].setAttribute("class", "c-entity_div");
			entity_shell.children[0].setAttribute("id", "c-"+entity_shell.children[0].id);
			entity_shell.children[0].setAttribute("onclick", "");
			entity_shell.children[1].setAttribute("style", "display:none;");
			entity_shell.children[2].setAttribute("style", "display:none;");
			if (entity_shell.children[3])
				entity_shell.removeChild(entity_shell.children[3]);
			c_lists.appendChild(entity_shell);
		}
		else
		{
			var c_lists = document.createElement("div");
			c_lists.setAttribute("class", "c-lists");
			c_lists.setAttribute("id", "c-"+family.children[1].id);
			c_family.appendChild(c_lists);
			var entity_shell = t.parentNode.cloneNode(true)
			var lists_delete = document.createElement("span");
			entity_shell.setAttribute("class", "c-entity_shell_div");
			entity_shell.setAttribute("id", "c-"+entity_shell.id);
			entity_shell.setAttribute("onclick", "delete_entity(this)");
			entity_shell.children[0].setAttribute("class", "c-entity_div");
			entity_shell.children[0].setAttribute("id", "c-"+entity_shell.children[0].id);
			entity_shell.children[0].setAttribute("onclick", "");
			entity_shell.children[1].setAttribute("style", "display:none;");
			entity_shell.children[2].setAttribute("style", "display:none;");
			if (entity_shell.children[3])
				entity_shell.removeChild(entity_shell.children[3]);
			lists_delete.setAttribute("class", "c-lists_delete");
			lists_delete.setAttribute("onclick", "delete_lists(this)");
			lists_delete.innerHTML = "&times"; 
			c_lists.appendChild(entity_shell);
			c_lists.appendChild(lists_delete);
		}
	}
}
// 删除整个类别
function delete_title(t)
{
	var family = t.parentNode;
	document.getElementById("choose-entity").removeChild(family);
}
// 删除类别下的实体
function delete_lists(t)
{
	var family = t.parentNode.parentNode.id;
	var lists = t.parentNode;
	document.getElementById(family).removeChild(lists);
}
// 删除单个实体
function delete_entity(t){
	var lists = t.parentNode;
	document.getElementById(lists.id).removeChild(t);
	if (lists.children.length==1)
	{
		var family = lists.parentNode.id;
		document.getElementById(family).removeChild(lists);
	}
}
// 修改实体分类
function change_category(t) {
	var new_tag = t.options[t.selectedIndex].value;
	var family = t.parentNode.parentNode.parentNode;
	if (new_tag==family.children[0].innerHTML)
		return;
	var i=0;
	while(family.parentNode.children[i])
	{
		if (new_tag==family.parentNode.children[i].children[0].innerHTML)
		{
			var new_family = family.parentNode.children[i];
			break;
		}
		i = i+1;
	}
	var entity_shell = t.parentNode.cloneNode(true);
	entity_shell.children[1].options[t.selectedIndex].selected=true;
	family.children[1].removeChild(t.parentNode);
	new_family.children[1].appendChild(entity_shell);
	if (document.getElementById("c-"+entity_shell.id))
	{
		var temp = document.getElementById("c-"+entity_shell.id);
		delete_entity(temp);
	}
	if (document.getElementById("c-"+new_family.id))
	{
		click_entity(entity_shell.children[0]);
	}
}
// 动态调整宽度
function inputWidth(e)
{
	$('#word-width').html(e.target.value);
	var inwidth = $('#word-width').width();
	if (inwidth<800)
		$('#'+e.target.id).width(inwidth);
};
// 暂时不用
function click_correct_upload_button()
{
	var origin = document.getElementById("correct-1").value;
	var alter = document.getElementById("correct-2").value;
	var entities = document.getElementsByClassName("entity_div");
	var string = document.getElementById("polish-reference-text").innerHTML;
	var i = 0;
	var exist = false;
	var exist_o = false;
	var exist_a = false;
	while(entities[i])
	{
		if (entities[i].innerHTML==origin)
		{
			exist_o = true;
			break;
		}
		i = i+1;
	}
	if(string.indexOf(alter)!=-1)
		exist_a = true;
	if (exist_o&&exist_a)
	{
		entities[i].innerHTML = alter;
		if (document.getElementById("c-"+entities[i].id))
			document.getElementById("c-"+entities[i].id).innerHTML = alter;
	}
	else if(!exist_o&&exist_a)
	{
		alert("待修改实体不在可选列表");
		return;
	}
	else if(exist_o&&!exist_a)
	{
		alert("原文中没有修改后实体");
		return;
	}
	else
	{
		alert("待修改实体不在可选列表且原文中没有修改后实体");
	}
}

// 生成三元组和可选实体/关系
var ent_av;
var rel_av;
function click_choose_word_button()
{
	document.getElementById('polish-triple-sub').innerHTML="Processing ... ";
	axios.post('/triple', Qs.stringify({
		text: "entities"
	}))
	.then(function (response) {
		var parent = document.getElementById('polish-triple-sub')
		parent.innerHTML = "";
		var triple_title_div = document.createElement("div");
		triple_title_div.setAttribute("class", "triple-title-container");
		parent.appendChild(triple_title_div);
		var triple_title_1 = document.createElement("div");
		var triple_title_2 = document.createElement("div");
		var triple_title_3 = document.createElement("div");
		//var triple_title_4 = document.createElement("div");
		triple_title_1.setAttribute("class", "triple-title");
		triple_title_1.innerHTML = "实体1";
		triple_title_2.setAttribute("class", "triple-title");
		triple_title_2.innerHTML = "关系";
		triple_title_3.setAttribute("class", "triple-title");
		triple_title_3.innerHTML = "实体2";
		triple_title_div.appendChild(triple_title_1);
		triple_title_div.appendChild(triple_title_2);
		triple_title_div.appendChild(triple_title_3);
		//triple_title_div.appendChild(triple_title_4);
		// 可视化三元组
		response = response.data;
		triples = response["tri"];
		entity1=triples[0];
		color_e1=triples[1];
		relation=triples[2];
		color_r=triples[3];
		entity2=triples[4];
		color_e2=triples[5];
		credit=triples[6];
		for (var i = 0; i < entity1.length; i++)
		{
			var triple_a = document.createElement("a");
			triple_a.setAttribute("class", "triple-line");
			triple_a.setAttribute("id", "triple-line"+i);
			parent.appendChild(triple_a);
			
			var sub_parent = document.getElementById("triple-line"+i);
			var num = document.createElement("div");
			var e1 = document.createElement("input");
			var r = document.createElement("input");
			var e2 = document.createElement("input");
			var c = document.createElement("input");
			var shut = document.createElement("span");
			
			num.setAttribute("class", "triple-num");
			num.innerHTML = i+1;
			
			e1.setAttribute("type", "text");
			e1.setAttribute("class", "e1");
			e1.setAttribute("id", "e1-"+i);
			e1.setAttribute("onfocus", "focus_on(this)");
			e1.setAttribute("onblur", "focus_out(this)");
			e1.value = entity1[i];
			if (color_e1[i]==1)
				color="background-color:#FFC78E;";
			else
				color="background-color:#93FF93;";
			e1.setAttribute("style", color);
			
			r.setAttribute("type", "text");
			r.setAttribute("class", "r");
			r.setAttribute("id", "r-"+i);
			r.setAttribute("onfocus", "focus_on(this)");
			r.setAttribute("onblur", "focus_out(this)");
			r.value = relation[i];
			if (color_r[i]==1)
				color="background-color:#FFC78E;";
			else
				color="background-color:#93FF93;";
			r.setAttribute("style", color);
			
			e2.setAttribute("type", "text");
			e2.setAttribute("class", "e2");
			e2.setAttribute("id", "e2-"+i);
			e2.setAttribute("onfocus", "focus_on(this)");
			e2.setAttribute("onblur", "focus_out(this)");
			e2.value = entity2[i];
			if (color_e2[i]==1)
				color="background-color:#FFC78E;";
			else
				color="background-color:#93FF93;";
			e2.setAttribute("style", color);
			
			c.setAttribute("type", "text");
			c.setAttribute("class", "c");
			c.setAttribute("id", "c-"+i);
			c.setAttribute("readonly", "readonly");
			c.value = credit[i];
			
			shut.setAttribute("class", "shut");
			shut.setAttribute("onclick", "shut_button(this)");
			shut.innerHTML = "&times";
			
			sub_parent.appendChild(num);
			sub_parent.appendChild(e1);
			sub_parent.appendChild(r);
			sub_parent.appendChild(e2);
			sub_parent.appendChild(c);
			sub_parent.appendChild(shut);
		}
		// 可视化可选实体
		var category = response["ent"]["category"];
		ent_av = response["ent"]["ent"];
		var ent_av_color = response["ent"]["color"];
		var parent_ent = document.getElementById("polish-reference-entity");
		var title2 = document.createElement("div");
		parent_ent.innerHTML = "";
		title2.setAttribute("id","reference-title2");
		title2.innerHTML = "可选实体";
		parent_ent.appendChild(title2);
		for (var i = 0; i < category.length; i++)
		{
			var family = document.createElement("div");
			var title = document.createElement("div");
			var lists = document.createElement("div");
			family.setAttribute("class", "r-family");
			parent_ent.appendChild(family);
			
			title.setAttribute("class", "r-title");
			title.innerHTML = category[i];
			lists.setAttribute("class", "r-lists");
			
			family.appendChild(title);
			family.appendChild(lists);
			
			var sub_entity = ent_av[i];
			var sub_entity_color = ent_av_color[i];
			for (var j=0; j<sub_entity.length; j++)
			{
				var entity_div = document.createElement("div");
				entity_div.setAttribute("class", "r-entity");
				if (sub_entity_color[j]==1)
					b_color="background-color:#FFC78E;";
				else
					b_color="background-color:#93FF93;";
				entity_div.setAttribute("style", b_color+"display:inline-block;");
				entity_div.innerHTML = sub_entity[j];
				lists.appendChild(entity_div)
			}
		}
		
		// 可视化可选关系
		rel_av = response["rel"]["rel"];
		var rel_av_color = response["rel"]["color"];
		var parent_rel = document.getElementById("polish-reference-relation");
		var title3 = document.createElement("div");
		parent_rel.innerHTML = "";
		title3.setAttribute("id","reference-title3");
		title3.innerHTML = "可选关系";
		parent_rel.appendChild(title3);
		for (var i = 0; i < rel_av.length; i++)
		{
			var relation = document.createElement("div");
			relation.setAttribute("class", "r-relation");
			if (rel_av_color[i]==1)
				b_color="background-color:#FFC78E;";
			else
				b_color="background-color:#93FF93;";
			relation.setAttribute("style", b_color+"display:inline-block;");
			relation.innerHTML = rel_av[i];
			parent_rel.appendChild(relation);
		}
	})
	.catch(function (error)
	{
		console.log(error);
	});
}
// 删除三元组
function shut_button(t)
{
	//t.parentElement.style.display="none";
	document.getElementById("polish-triple-sub").removeChild(t.parentNode);
	triple_sort();
}
// 三元组排序
function triple_sort()
{
	triples = document.getElementsByClassName("triple-line");
	for(var i = 0; i < triples.length; i++)
	{
		triples[i].children[0].innerHTML = i+1;
	}
	
}
// 准备修改
function focus_on(t)
{
	document.getElementById("cache").innerHTML = t.value;
}
// 修改完成
function focus_out(t)
{
	cache = document.getElementById("cache").innerHTML;
	if(t.class=="r")
	{
		if(rel_av.indexOf(t.value)>-1||(t.value==""&&cache==""))
			return;
		alert("请检查关系是否为可选项");
		t.value = cache;
		return;
	}
	else
	{
		ent_av = [].concat.apply([],ent_av);
		if(ent_av.indexOf(t.value)>-1||(t.value==""&&cache==""))
			return;
		alert("请检查实体是否为可选项");
		t.value = cache;
		return;
	}
}

function click_change_triple_button()
{
	
}
// 点击新增三元组
var add_num=0;
function click_add_triple_button() 
{
	parent=document.getElementById("polish-triple-sub");
	var triple_a = document.createElement("a");
	triple_a.setAttribute("class", "triple-line");
	triple_a.setAttribute("id", "triple-line-add"+add_num);
	parent.appendChild(triple_a);
	
	var sub_parent = document.getElementById("triple-line-add"+add_num);
	var num = document.createElement("div");
	var e1 = document.createElement("input");
	var r = document.createElement("input");
	var e2 = document.createElement("input");
	var c = document.createElement("input");
	var shut = document.createElement("span");
	var color = "background-color:d0d0d0";
	
	num.setAttribute("class", "triple-num");
	
	e1.setAttribute("type", "text");
	e1.setAttribute("class", "e1");
	e1.setAttribute("id", "e1-add"+add_num);
	e1.setAttribute("style", color);
	e1.setAttribute("onfocus", "focus_on(this)");
	e1.setAttribute("onblur", "focus_out(this)");
	
	r.setAttribute("type", "text");
	r.setAttribute("class", "r");
	r.setAttribute("id", "r-add"+add_num);
	r.setAttribute("style", color);
	r.setAttribute("onfocus", "focus_on(this)");
	r.setAttribute("onblur", "focus_out(this)");
	
	e2.setAttribute("type", "text");
	e2.setAttribute("class", "e2");
	e2.setAttribute("id", "e2-add"+add_num);
	e2.setAttribute("style", color);
	e2.setAttribute("onfocus", "focus_on(this)");
	e2.setAttribute("onblur", "focus_out(this)");
	
	c.setAttribute("type", "text");
	c.setAttribute("class", "c");
	c.setAttribute("id", "c-add"+add_num);
	c.setAttribute("readonly", "readonly");
	
	shut.setAttribute("class", "shut");
	shut.setAttribute("onclick", "shut_button(this)");
	shut.innerHTML = "&times";
	
	sub_parent.appendChild(num);
	sub_parent.appendChild(e1);
	sub_parent.appendChild(r);
	sub_parent.appendChild(e2);
	sub_parent.appendChild(c);
	sub_parent.appendChild(shut);
	
	triple_sort();
	
	add_num=add_num+1;
}







