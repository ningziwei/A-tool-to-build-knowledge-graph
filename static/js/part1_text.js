// 获取文本
function catch_text_button()
{
	if (document.getElementById('input-url').value=="")
	{
		alert("网址不能为空");
		return;
	}
	axios.post('/catch', Qs.stringify({
		url: document.getElementById('input-url').value
	}))
	.then(function (response) {
		document.getElementById("input-text").value = response.data["text"];
	})
	.catch(function (error)
	{
		console.log(error);
	});
}

// 全局变量，前端修改数据会直接修改全局变量，然后通过全局变量同步其他模块的显示结果
var ent_ch;
var ent_en;
var entity_result;
var ent_confidence={};
var ent_color_id=[];
var ent_selected_exhibits=[];
var attr_ch;
var attr_en;
var attr_ent;
var attribute_result;
var attr_confidence={};
var attr_color_id=[];
var attr_selected_exhibits=[];
var triples_ent;
var triples_attr;

// 上传文本，显示分词结果和实体
function NER_button()
{
	if (document.getElementById('input-text').value == "")
	{
		alert("输入文本不能为空");
		return;
	}
	$('#resultInText-ent').html("Processing ... ");
	$('#resultInText-attr').html("Processing ... ");
	axios.post('/split', Qs.stringify({
		text: document.getElementById('input-text').value
	}))
	.then(function (response) {
		initial();
		// 直接根据实体，位置生成可视化界面
		ent_ch = response.data["ent_ch"];
		ent_en = response.data["ent_en"];
		entity_result = response.data["entity"];
		attr_ch = response.data["attr_ch"];
		attr_en = response.data["attr_en"];
		attr_ent = response.data["attr_ent"];
		attribute_result = response.data["attribute"];
		
		// 作为原文传入关系抽取模块，避免用户在操作实体过程中修改原文
		$('#input-cache').html($('#input-text').val());
		
		// 删掉原有类别选项卡
		if ($('.color-index'))
		{
			for (var i = 0; i < $('.color-index').length; i++)
				$('.color-index')[i].remove();
		}
		
		// 显示实体抽取结果
		ent_color_id = list_dic('ent', ent_en);
		gen_category_index('container-resultInText-ent', ent_ch, ent_en);
		display_result_in_text('resultInText-ent', entity_result);
		display_result_in_list('resultInLists-ent', entity_result);
		// 显示属性抽取结果
		attr_color_id = list_dic('attr', attr_en);
		gen_category_index('container-resultInText-attr', attr_ch, attr_en);
		display_result_in_text('resultInText-attr', attribute_result);
		display_result_in_list('resultInLists-attr', attribute_result);
	})
	.catch(function (error)
	{
		console.log(error);
	});
}

// 将列表转为字典
function list_dic(tag, list)
{
	var list_dic = {};
	for (var i = 0; i < list.length; i++)
	{
		list_dic[list[i]] = (tag == 'ent')? i:ent_color_id[attr_ent[i]];
	}
	return list_dic;
}