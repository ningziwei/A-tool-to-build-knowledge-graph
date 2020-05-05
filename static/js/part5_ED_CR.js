// 展示实体消歧/指代消解结果
function display_ED_CR(mark, items)
{
	var showcase = document.getElementById('showcase-' + mark);
	var title_line = create_element('tr', 'ED_CR-title-line');
	var title_entity = create_element('td', 'ED_CR-title-entity');
	var title_entity_source = create_element('td', 'ED_CR-title-source');
	var title_result = create_element('td', 'ED_CR-title-result');
	var title_discription = create_element('td', 'ED_CR-title-discription');
	showcase.innerHTML = '';
	title_entity.innerHTML = '实体';
	title_entity_source.innerHTML = '原文出处';
	title_result.innerHTML = (mark=='ED')? '消歧结果':'共指结果';
	title_discription.innerHTML = '描述';
	showcase.appendChild(title_line);
	title_line.append(title_entity);
	title_line.append(title_entity_source);
	title_line.append(title_result);
	title_line.append(title_discription);
	for (var i = 0; i < items.length; i++)
	{
		var item = items[i];
		var item_line = create_element('tr', 'ED_CR-line');
		var entity = create_element('td', 'ED_CR-entity');
		var entity_source = create_element('td', 'ED_CR-source');
		var result = create_element('td');
		var result_shell = create_element('div', '', '', 'position: relative;');
		var discription = create_element('td', 'ED_CR-discription');
		var result_div = create_element('div', 'ED_CR-result')
		var result_select = create_element('select', 'ED_CR-result_select', 'select-'+mark+'-'+i);
		var result_dis_lists = create_element('div', '', '', 'display:none;')
		
		entity.innerHTML = item[0][0];
		entity_source.innerHTML = item[0][1];
		
		result_select.setAttribute('onchange', 'ED_CR_change_category(this)');
		for (var j = 0; j < item[1].length; j++)
		{
			var opt = create_element("option");
			var dis = create_element('div', '', '', 'display:none;');
			opt.setAttribute("value", item[1][j][0]);
			opt.innerHTML = item[1][j][0];
			if (item[0][2] == j)
			{
				opt.setAttribute("selected","selected");
				result_div.innerHTML = item[1][j][0];
				discription.innerHTML = item[1][j][1];
			}
			dis.innerHTML = item[1][j][1];
			
			result_select.appendChild(opt);
			result_dis_lists.appendChild(dis);
		}
		
		showcase.appendChild(item_line);
		item_line.appendChild(entity);
		item_line.appendChild(entity_source);
		item_line.appendChild(result);
		item_line.appendChild(discription);
		result.appendChild(result_shell);
		result_shell.appendChild(result_div);
		result_shell.appendChild(result_select);
		result_shell.appendChild(result_dis_lists);
	}
}
// 修改消歧/指代结果
function ED_CR_change_category(t) {
	var tag = t.id.split('-')[1];
	var line_num = t.id.split('-')[2];
	var cat_num = t.selectedIndex;
	var result = (tag=='ED')? ED_result:CR_result;
	t.parentNode.parentNode.parentNode.children[3].innerHTML = t.parentNode.children[2].children[cat_num].innerHTML;
	t.parentNode.children[0].innerHTML = t.options[cat_num].value;
	result[line_num][0][2] = cat_num;
}


