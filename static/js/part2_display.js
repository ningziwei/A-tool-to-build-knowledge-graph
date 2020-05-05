// 生成类别选项卡，选择类别后，点击文本，即可将点击内容标记为相应类别
function gen_category_index(target, ch, en)
{
	var shell = $('#'+target);
	var tag = target.split('-')[2];
	var color_index = create_element('div', 'color-index');
	var color_id_dic = (tag == 'ent')? ent_color_id:attr_color_id;
	for (var i = 0; i < ch.length; i++)
	{
		var color = can_color[color_id_dic[en[i]]];
		var index = color_id_dic[en[i]];
		var style = "background-color:" + color;
		var color_shell = create_element('div', 'color-shell ', 'color-shell-'+tag+'-'+index+'-'+en[i], style);
		color_shell.setAttribute('onclick', 'onclick_color_shell(this)');
		color_shell.innerHTML = ch[i];
		color_index.append(color_shell)
	}
	var style = "background-color:" + can_color[-1];
	var color_shell = create_element('div', 'color-shell ', 'color-shell-'+tag+'-'+'-', style);
	color_shell.setAttribute('onclick', 'onclick_color_shell(this)');
	color_shell.innerHTML = '其他';
	color_index.append(color_shell)
	
	shell.append(color_index);
	var ctrl_state = create_element('div', '', 'ctrl-state-'+tag, 'display:none;');
	var ctrl_loc0 = create_element('div', '', 'ctrl-loc0-'+tag, 'display:none;');
	var cat_current = create_element('div', '', 'cat-current-'+tag, 'display:none;');
	ctrl_state.innerHTML = 0;
	color_index.append(ctrl_state);
	color_index.append(ctrl_loc0);
	color_index.append(cat_current);
}
// 在选项卡中选不同的类别
function onclick_color_shell(t)
{
	var tag = t.id.split('-')[2];
	var color_id = t.id.split('-')[3];
	var cat = t.id.split('-')[4];
	var children = t.parentNode.childNodes;
	if (color_id == '')
	{
		color_id = -1;
		cat = 'other';
	}
	$('#color-current-'+tag).html(can_color[color_id]);
	$('#cat-current-'+tag).html(cat);
	for (var i = 0; i < children.length; i++)
	{
		if (children[i].className=='color-shell color-current')
			children[i].className='color-shell';
	}
	t.className = 'color-shell color-current';
}


// 把一段相同颜色的字全部加入hall中
function append_section(string, hall, start, cat, tag)
{
	for (var i = 0; i < string.length; i++)
	{
		var word_div = create_element('div', 'word-div-'+tag, "word-div-"+cat+'-'+(start+i))
		word_div.innerHTML = string[i];
		word_div.setAttribute('onclick', 'onclick_word_div(this, event)');
		hall.appendChild(word_div);
	}
}
// 把一段未识别的字加入hall中
function append_unident_section(string, hall, start, tag)
{
	var color = can_color[-1];
	var style = "background-color:" + color + "border: 1px solid " + color;
	for (var i = 0; i < string.length; i++)
	{
		var word_div = create_element('div', 'word-div-'+tag+' unident', "word-div-"+'-'+(start+i), style)
		word_div.innerHTML = string[i];
		word_div.setAttribute('onclick', 'onclick_word_div(this, event)');
		hall.append(word_div);
	}
}
// 在原文上展示抽取的效果
function display_result_in_text(target, exhibits)
{
	var tag = target.split('-')[1];
	var string = $('#input-cache').html();
	var hall = $('#' + target);
	var start = 0;
	var cat_color = (tag=='ent')? ent_color_id:attr_color_id;
	hall.html('');
	if (exhibits.length == 0)
	{
		append_unident_section(string, hall, 0, tag);
	}
	else
	{
		for (var exh_num = 0; exh_num < exhibits.length; exh_num++)
		{
			var exhibit = exhibits[exh_num];
			var exh = exhibit[0];
			var cat = exhibit[1];
			var exh_begin  = exhibit[2];
			var exh_end = exhibit[3];
			if (start < exh_begin)
			{
				append_unident_section(string.substr(start, exh_begin-start), hall, start, tag);
			}
			var color = can_color[cat_color[cat]];
			var style = "background-color:" + color;
			var exh_shell = create_element('div', 'exh-shell', '', style);
			append_section(string.substr(exh_begin, exh_end-exh_begin), exh_shell, exh_begin, cat, tag);
			hall.append(exh_shell);
			start = exh_end;
		}
		if (start < string.length)
		{
			append_unident_section(string.substr(start, string.length-start), hall, start, tag);
		}
	}
	var children = hall.children();
	for (var i = 0; i < children.length-1; i++)
	{
		// 当未识别字后面紧跟一个识别字的时候，修改此未识别字的右间距，以此保证展示出来的效果是整洁的。
		if (children[i].className == 'word-div-'+tag+' unident' && children[i+1].className == 'exh-shell')
		{
			children[i].style.marginRight = '6px';
		}
	}
}


// 用户点击文本，实现对文本分类结果的修改
function onclick_word_div(t, e)
{
	if (e.ctrlKey)
		console.log(true);
	var tag = t.className.split(' ')[0].split('-')[2];
	var loc = parseInt(t.id.split('-')[3]);
	var cat_new = $('#cat-current-'+tag).html();
	var ctrl_state = $('#ctrl-state-'+tag).html();
	if (cat_new!='')
	{
		var result = (tag=='ent')? entity_result:attribute_result;
		if (e.ctrlKey)
		{
			// 之前没有选择过字
			if (ctrl_state==0)
			{
				$('#ctrl-loc0-'+tag).html(loc);
				$('#ctrl-state-'+tag).html(1);
				t.className = 'word-div-' + tag + ' ctrl-word0';
			}
			// 之前已经选择了一个字
			else if (ctrl_state==1)
			{
				loc0 = parseInt($('#ctrl-loc0-'+tag).html());
				ctrl_click(cat_new, loc0, loc, result);
				$('#ctrl-state-'+tag).html(0);
				display_result_in_text('resultInText-'+tag, result);
				display_result_in_list('resultInLists-'+tag, result);
			}
			return;
		}
		// 不按ctrl点击单字时，消除掉之前ctrl选择的状态
		if (ctrl_state==1)
		{
			ctrl_word0 = document.getElementsByClassName('ctrl-word0')[0];
			ctrl_word0.className = 'word-div-' + tag;
			$('#ctrl-state-'+tag).html(0);
		}
		only_click(cat_new, loc, result);
		display_result_in_text('resultInText-'+tag, result);
		display_result_in_list('resultInLists-'+tag, result);
	}
}
// 只是点击单个字，修改当前字的分类
function only_click(cat, loc, result)
{
	var string = $('#input-cache').html();
	var exhibit = [string[loc], cat, loc, loc+1];
	for (var i = 0; i < result.length; i++)
	{
		if (result[i][3] > loc)
			break;
	}
	// 点击字在所有识别位置后面
	if (i == result.length)
	{
		if (cat != 'other')
			result.splice(i, 0, exhibit);
		return;
	}
	// 点击的字未识别
	if (result[i][2] > loc)
	{
		if (cat != 'other')
			result.splice(i, 0, exhibit);
		return;
	}
	// 点击的字已识别且在该条目开头
	if (result[i][2] == loc)
	{
		// 该识别条目长度为1
		if (result[i][3]-result[i][2]==1)
		{
			if (cat != 'other')
				result[i][1] = cat;
			else
				result.splice(i, 1);
			return;
		}
		// 识别条目长度大于1
		else
		{
			result[i][2] = loc + 1;
			result[i][0] = string.substr(result[i][2], result[i][3]-result[i][2]);
			if (cat != 'other')
				result.splice(i, 0, exhibit);
			return;
		}
	}
	// 点击的字已识别且在该条目结尾
	if (result[i][3]-1 == loc)
	{
		result[i][3] = loc;
		result[i][0] = string.substr(result[i][2], result[i][3]-result[i][2]);
		if (cat != 'other')
			result.splice(i+1, 0, exhibit);
		return;
	}
	// 点击的字已识别且在该条目中间
	var exhibit2 = $.extend(true, [], result[i]);
	result[i][3] = loc;
	result[i][0] = string.substr(result[i][2], result[i][3]-result[i][2]);
	exhibit2[2] = loc + 1;
	exhibit2[0] = string.substr(exhibit2[2], exhibit2[3]-exhibit2[2]);
	if (cat != 'other')
	{
		result.splice(i+1, 0, exhibit);
		result.splice(i+2, 0, exhibit2);
	}
	else
		result.splice(i+1, 0, exhibit2);
	return;
}
// 按着ctrl键点击字，将连续点击的两个字之间的内容当作一个实体，并修改分类
function ctrl_click(cat, loc1, loc2, result)
{
	if (loc1==loc2)
	{
		only_click(cat, loc1, result);
		return;
	}
	var begin = (loc1<loc2)? loc1:loc2;
	var end = (loc1>loc2)? loc1:loc2;
	var string = $('#input-cache').html();
	var selected_string = string.substr(begin,end-begin+1);
	var selected_length = selected_string.length;
	var all_position = [];
	var pos = string.indexOf(selected_string);
	
	while (pos > -1)
	{
		all_position.push([pos, pos + selected_length]);
		pos = string.indexOf(selected_string, pos + 1);
	}
	
	for (var i = 0; i < all_position.length; i++)
	{
		begin = all_position[i][0];
		end = all_position[i][1]-1;
		var exhibit = [selected_string, cat, begin, end+1];
		for (var b = 0; b < result.length; b++)
		{
			if (result[b][3] > begin)
				break;
		}
		// 新词在所有已识别词的后面
		if (b == result.length)
		{
			if (cat != 'other')
				result.splice(b, 0, exhibit);
			continue;
		}
		for (var e = 0; e < result.length; e++)
		{
			if (result[e][3] > end)
				break;
		}
		// 新词部分在所有已识别词后面
		if (e == result.length)
		{
			// 头部处于未识别区或识别区第一个
			if (begin <= result[b][2])
			{
				result.splice(b, e-b, exhibit);
				if (cat == 'other')
					result.splice(b, 1);
				continue;
			}
			// 头部处于识别区第一个位置之后
			else
			{
				result[b][3] = begin;
				result[b][0] = string.substr(result[b][2], result[b][3]-result[b][2]);
				result.splice(b+1, e-b-1, exhibit);
				if (cat == 'other')
					result.splice(b+1, 1);
				continue;
			}
		}
		
		// 两个点击字都在未识别段
		if (begin < result[b][2] && end < result[e][2])
		{
			result.splice(b, e-b, exhibit);
			if (cat == 'other')
				result.splice(b, 1);
			continue;
		}
		// 头不在尾在
		if (begin < result[b][2] && end >= result[e][2])
		{
			if (end == result[e][3]-1)
				result.splice(b, e-b+1, exhibit);
			else
			{
				result[e][2] = end + 1;
				result[e][0] = string.substr(result[e][2], result[e][3]-result[e][2]);
				result.splice(b, e-b, exhibit);
			}
			if (cat == 'other')
				result.splice(b, 1);
			continue;
		}
		// 头在尾不在
		if (begin >= result[b][2] && end < result[e][2])
		{
			if (begin == result[b][2])
			{
				result.splice(b, e-b, exhibit);
				if (cat == 'other')
					result.splice(b, 1);
			}
			else
			{
				result[b][3] = begin;
				result[b][0] = string.substr(result[b][2], result[b][3]-result[b][2]);
				result.splice(b+1, e-b-1, exhibit);
				if (cat == 'other')
					result.splice(b+1, 1);
			}
			continue;
		}
		// 头尾都在
		if (begin >= result[b][2] && end >= result[e][2])
		{
			if (begin == result[b][2] && end == result[e][3]-1)
			{
				result.splice(b, e-b+1, exhibit);
				if (cat == 'other')
					result.splice(b, 1);
			}
			else if (begin == result[b][2] && end < result[e][3]-1)
			{
				result[e][2] = end + 1;
				result[e][0] = string.substr(result[e][2], result[e][3]-result[e][2]);
				result.splice(b, e-b, exhibit);
				if (cat == 'other')
					result.splice(b, 1);
			}
			else if (begin > result[b][2] && end < result[e][3]-1)
			{
				if (e!=b)
				{
					result[b][3] = begin;
					result[b][0] = string.substr(result[b][2], result[b][3]-result[b][2]);
					result[e][2] = end + 1;
					result[e][0] = string.substr(result[e][2], result[e][3]-result[e][2]);
					result.splice(b+1, e-b-1, exhibit);
					if (cat == 'other')
						result.splice(b+1, 1);
				}
				else
				{
					var temp = $.extend(true, [], result[b]);
					result.splice(b+1, 0, temp);
					result[b][3] = begin;
					result[b][0] = string.substr(result[b][2], result[b][3]-result[b][2]);
					result[e+1][2] = end + 1;
					result[e+1][0] = string.substr(result[e+1][2], result[e+1][3]-result[e+1][2]);
					result.splice(b+1, 0, exhibit);
					if (cat == 'other')
						result.splice(b+1, 1);
				}
			}
			else if (begin > result[b][2] && end == result[e][3]-1)
			{
				result[b][3] = begin;
				result[b][0] = string.substr(result[b][2], result[b][3]-result[b][2]);
				result.splice(b+1, e-b, exhibit);
				if (cat == 'other')
					result.splice(b+1, 1);
			}
			continue;
		}
	}
}





