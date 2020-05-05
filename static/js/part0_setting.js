$(document).ready(function() {
	$("#myModal").modal("show");
})

function save_option()
{
	$("#myModal").modal("hide");
}

var p21 = ['可识别类型只有人名、地名、机构名、其他等笼统分类的模型'];
var p22 = ['模型除了可以识别人名、地名、机构名、其他等笼统类别外，在每个类下还可识别运动员、顾客、领导、团队、政党等更加详细的分类'];

function set_help(t, p)
{
	var id = "text-" + t.id;
	var parent = t.parentNode;
	if (document.getElementById(id))
	{
		parent.removeChild(document.getElementById(id));
		return;
	}
	if (document.getElementsByClassName("help-div")[0])
	{
		var node = document.getElementsByClassName("help-div")[0];
		node.parentNode.removeChild(node);
	}
	var help = document.createElement("div");
	var help_delete = document.createElement("span");
	var content = document.createElement("div");
	help.setAttribute("class", "help-div");
	help.setAttribute("id", id);
	parent.appendChild(help);
	for (var i =0; i < p.length; i++)
	{
		var temp = document.createElement("p");
		temp.innerHTML = p[i];
		content.appendChild(temp);
	}
	content.setAttribute("class", "help-content");
	help_delete.setAttribute("class", "parent_delete");
	help_delete.setAttribute("onclick", "delete_parent(this)");
	help_delete.innerHTML = "&times";
	help.appendChild(help_delete);
	help.appendChild(content);
}
